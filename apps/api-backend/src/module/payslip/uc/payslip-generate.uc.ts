import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import type { PayslipGenerateRequestType, PayslipGenerateResponseType, PayslipListResponseType } from '@repo/dto';
import { PrismaService } from '@repo/nest-lib';
import { CommonLoggerService, ContactDao, CurrentUserType, IUseCase, LeaveDao, OrganizationHasAddressDao, PayrollPayslipDao, PayrollCompensationDao, PayrollDeductionDao, EmployeeDao, OrganizationDao } from '@repo/nest-lib';
import type { PayrollPayslipWithDetailsType, PayrollCompensationWithLineItemsType, PayrollDeductionWithLineItemsType } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';
import { buildPayslipTemplateData } from '@repo/shared';

import { S3Service } from '../../../external-service/s3.service.js';
import { PdfGeneratorService } from '../../../service/pdf/pdf-generator.service.js';
import { BasePayslipUc, CurrencyInfo } from './_base-payslip.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: PayslipGenerateRequestType;
};

type OrgData = {
  companyName: string;
  companyLogoUrl: string | null;
  currencySymbol: string | null;
  currencyCode: string;
  companyAddress: string;
  companyPhones: string[];
  companyEmails: string[];
  companyWebsites: string[];
};

@Injectable()
export class PayslipGenerateUc extends BasePayslipUc implements IUseCase<Params, PayslipGenerateResponseType> {
  public constructor(
    logger: CommonLoggerService,
    prisma: PrismaService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly employeeDao: EmployeeDao,
    private readonly payrollCompensationDao: PayrollCompensationDao,
    private readonly payrollDeductionDao: PayrollDeductionDao,
    private readonly leaveDao: LeaveDao,
    private readonly organizationDao: OrganizationDao,
    private readonly organizationHasAddressDao: OrganizationHasAddressDao,
    private readonly contactDao: ContactDao,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<PayslipGenerateResponseType> {
    const { month, year, force, employeeIds } = params.dto;
    this.logger.i('Generating payslips', { month, year, employeeIds, force });
    const validateResult = await this.validate(params);
    const { existingPayslips, targetUserIds } = validateResult;

    if (existingPayslips.length > 0 && !force) {
      return {
        generated: 0,
        skipped: existingPayslips.length,
        alreadyExisting: true,
        existingPayslips,
      };
    }

    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const totalDaysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const users = await this.prisma.user.findMany({
      where: { id: { in: targetUserIds } },
      select: { id: true, firstname: true, lastname: true },
    });
    const userNameMap = new Map(users.map((u) => [u.id, { firstname: u.firstname, lastname: u.lastname }]));

    const createdPayslips: PayrollPayslipWithDetailsType[] = [];
    let generated = 0;
    let skipped = 0;

    await this.prisma.$transaction(async (tx) => {
      const organizationId = params.currentUser.organizationId;
      await this.deleteOldPayslips({ force, existingPayslips, organizationId, tx });

      for (const userId of targetUserIds) {
        const result = await this.generatePayslipForUser({ currentUser: params.currentUser, userId, firstDay, lastDay, totalDaysInMonth, year, month, userNameMap, tx });
        if (result.skipped) {
          skipped++;
          continue;
        }
        if (result.created) {
          createdPayslips.push(result.created);
          generated++;
        }
      }
    });

    const orgData = await this.getOrganizationData(params.currentUser.organizationId);
    await Promise.all(createdPayslips.map((p) => this.generateAndUploadPdf(p, orgData)));

    return { generated, skipped, alreadyExisting: false };
  }

  private async generatePayslipForUser(args: {
    currentUser: CurrentUserType;
    userId: number;
    firstDay: Date;
    lastDay: Date;
    totalDaysInMonth: number;
    year: number;
    month: number;
    userNameMap: Map<number, { firstname: string; lastname: string }>;
    tx: Prisma.TransactionClient;
  }): Promise<{ skipped: boolean; created?: PayrollPayslipWithDetailsType }> {
    const { userId, firstDay, lastDay, totalDaysInMonth, year, month, userNameMap, tx } = args;
    const organizationId = args.currentUser.organizationId;

    const overlappingComps = await this.getCompensations({ userId, lastDay, firstDay, organizationId });
    if (overlappingComps.length === 0) {
      return { skipped: true };
    }

    const openEndedComps = overlappingComps.filter((c) => !c.effectiveTill);
    if (openEndedComps.length > 1) {
      throw new ApiBadRequestError(`Employee ${userId} has ${openEndedComps.length} compensations with no end date. Only the latest compensation can have no end date.`);
    }

    const applicableDeductions = await this.getApplicableDeductions({ userId, lastDay, firstDay, year, month, organizationId });

    const earningLineItems = this.getEarningLineItems({ overlappingComps, firstDay, totalDaysInMonth, year, month });

    const deductionLineItems = this.getDeductionLineItems(applicableDeductions, year, month);

    const totalGross = earningLineItems.reduce((s, e) => s + e.amount, 0);
    const lopDaysCount = await this.leaveDao.sumLopDaysByUserIdAndDateRange({ userId, startDate: firstDay, endDate: lastDay, organizationId });
    const lopAmount = lopDaysCount > 0 ? Math.round((totalGross / totalDaysInMonth) * lopDaysCount) : 0;
    if (lopAmount > 0) {
      deductionLineItems.push({ type: 'deduction' as const, title: 'Loss of Pay', amount: lopAmount });
    }

    const grossAmount = earningLineItems.reduce((s, e) => s + e.amount, 0);
    const deductionAmount = deductionLineItems.reduce((s, d) => s + d.amount, 0);
    const netAmount = grossAmount - deductionAmount;

    const userName = userNameMap.get(userId);
    const s3Key = this.buildS3Key({ userId, firstname: userName?.firstname ?? '', lastname: userName?.lastname ?? '', month, year });

    const createdId = await this.createPayslip({ userId, organizationId, month, year, grossAmount, deductionAmount, netAmount, earningLineItems, deductionLineItems, s3Key, tx });
    const created = await this.payrollPayslipDao.getById({ id: createdId, organizationId, tx });
    if (!created) {
      throw new ApiBadRequestError(`Failed to fetch created payslip for employee ${userId}`);
    }
    return { skipped: false, created };
  }

  private async validate(params: Params): Promise<{ currency: CurrencyInfo; existingPayslips: PayslipListResponseType[]; targetUserIds: number[] }> {
    this.assertAdmin(params.currentUser);
    const organizationId = params.currentUser.organizationId;
    const org = await this.organizationDao.getByIdOrThrow({ id: organizationId });
    const currency: CurrencyInfo = { symbol: org.currency.symbol, code: org.currency.code };

    let targetUserIds: number[];
    if (params.dto.employeeIds?.length) {
      targetUserIds = params.dto.employeeIds;
    } else {
      const employees = await this.employeeDao.findAllWithUser({ organizationId });
      targetUserIds = employees.map((e) => e.userId);
    }

    if (targetUserIds.length === 0) {
      throw new ApiBadRequestError('No employees found to generate payslips');
    }

    const dbExistingPayslips = await this.payrollPayslipDao.findManyByMonthYear({
      month: params.dto.month,
      year: params.dto.year,
      employeeIds: targetUserIds,
      organizationId,
    });

    const existingPayslips = dbExistingPayslips.map((p) => this.dbToPayslipListResponse(p, currency));
    return { currency, existingPayslips, targetUserIds };
  }

  private async generateAndUploadPdf(payslip: PayrollPayslipWithDetailsType, orgData: OrgData): Promise<void> {
    try {
      const pdfData = buildPayslipTemplateData(this.mapToDetail(payslip), {
        companyName: orgData.companyName,
        companyLogoUrl: orgData.companyLogoUrl,
        currencySymbol: orgData.currencySymbol,
        currencyCode: orgData.currencyCode,
        companyAddress: orgData.companyAddress,
        companyPhones: orgData.companyPhones,
        companyEmails: orgData.companyEmails,
        companyWebsites: orgData.companyWebsites,
      });
      const pdfBuffer = await this.pdfGeneratorService.generatePayslipPdf(pdfData);
      await this.s3Service.uploadBuffer({ s3Key: payslip.pdfS3Key, buffer: pdfBuffer, contentType: 'application/pdf' });
    } catch (err) {
      this.logger.e('Failed to generate/upload payslip PDF', { payslipId: payslip.id, error: String(err) });
    }
  }

  private async getOrganizationData(organizationId: number): Promise<OrgData> {
    try {
      const org = await this.organizationDao.getByIdWithLogoOrThrow({ id: organizationId });
      const [companyLogoUrl, addressLinks, contacts] = await Promise.all([
        org.logo ? this.s3Service.getSignedUrl(org.logo.key) : Promise.resolve(null),
        this.organizationHasAddressDao.findByOrganizationId({ organizationId }),
        this.contactDao.findByOrganizationId({ organizationId }),
      ]);

      let companyAddress = '';
      if (addressLinks.length > 0) {
        const addr = addressLinks[0].address;
        const parts = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.postalCode, addr.country.name].filter((p) => p?.length);
        companyAddress = parts.join(', ');
      }

      const companyPhones = contacts.filter((c) => c.contactType === 'phone').map((c) => c.contact);
      const companyEmails = contacts.filter((c) => c.contactType === 'email').map((c) => c.contact);
      const companyWebsites = contacts.filter((c) => c.contactType === 'website').map((c) => c.contact);

      return { companyName: org.name, companyLogoUrl, currencySymbol: org.currency.symbol, currencyCode: org.currency.code, companyAddress, companyPhones, companyEmails, companyWebsites };
    } catch {
      return { companyName: 'Company Name', companyLogoUrl: null, currencySymbol: '₹', currencyCode: 'INR', companyAddress: '', companyPhones: [], companyEmails: [], companyWebsites: [] };
    }
  }

  private buildS3Key(params: { userId: number; firstname: string; lastname: string; month: number; year: number }): string {
    const name = `${params.firstname}_${params.lastname}`.replace(/\s+/g, '_');
    return `user/${params.userId}/payslip-${name}-${params.month}-${params.year}.pdf`;
  }

  private mapToDetail(p: PayrollPayslipWithDetailsType) {
    return {
      id: p.id,
      employeeId: p.userId,
      employeeFirstname: p.user.firstname,
      employeeLastname: p.user.lastname,
      employeeEmail: p.user.email,
      employeeDesignation: p.user.employees?.[0]?.designation ?? '',
      month: p.month,
      year: p.year,
      grossAmount: p.grossAmount,
      netAmount: p.netAmount,
      deductionAmount: p.deductionAmount,
      lineItems: p.payrollPayslipLineItems.map((li) => ({
        id: li.id,
        payslipId: li.payslipId,
        type: li.type,
        title: li.title,
        amount: li.amount,
        createdAt: li.createdAt.toISOString(),
        updatedAt: li.updatedAt.toISOString(),
      })),
    };
  }

  private async createPayslip(params: {
    userId: number;
    organizationId: number;
    month: number;
    year: number;
    grossAmount: number;
    deductionAmount: number;
    netAmount: number;
    s3Key: string;
    earningLineItems: Prisma.PayrollPayslipLineItemCreateWithoutPayslipInput[];
    deductionLineItems: Prisma.PayrollPayslipLineItemCreateWithoutPayslipInput[];
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    return this.payrollPayslipDao.create({
      tx: params.tx,
      data: {
        user: { connect: { id: params.userId } },
        organization: { connect: { id: params.organizationId } },
        month: params.month,
        year: params.year,
        grossAmount: params.grossAmount,
        deductionAmount: params.deductionAmount,
        netAmount: params.netAmount,
        pdfS3Key: params.s3Key,
        payrollPayslipLineItems: {
          create: [...params.earningLineItems, ...params.deductionLineItems],
        },
      },
    });
  }

  /**
   * Build earning line items from compensation line items, pro-rated by active calendar days.
   * Compensation amounts are yearly; monthly = value / 12, then pro-rated.
   */
  private getEarningLineItems(params: {
    overlappingComps: PayrollCompensationWithLineItemsType[];
    firstDay: Date;
    totalDaysInMonth: number;
    year: number;
    month: number;
  }): Array<{ type: 'earning'; title: string; amount: number }> {
    // Aggregate amounts by line item title across all overlapping compensations
    const titleAmountMap = new Map<string, number>();

    for (const comp of params.overlappingComps) {
      const compFrom = new Date(comp.effectiveFrom);
      compFrom.setUTCHours(0, 0, 0, 0);

      const startDay = compFrom < params.firstDay ? 1 : compFrom.getUTCDate();

      let endDay: number;
      if (!comp.effectiveTill) {
        endDay = params.totalDaysInMonth;
      } else {
        const compTill = new Date(comp.effectiveTill);
        const tillYear = compTill.getUTCFullYear();
        const tillMonth = compTill.getUTCMonth() + 1;
        endDay = tillYear > params.year || (tillYear === params.year && tillMonth > params.month) ? params.totalDaysInMonth : compTill.getUTCDate();
      }

      const prorataFactor = (endDay - startDay + 1) / params.totalDaysInMonth;

      for (const lineItem of comp.payrollCompensationLineItems) {
        const prorated = Math.round((lineItem.amount / 12) * prorataFactor);
        const current = titleAmountMap.get(lineItem.title) ?? 0;
        titleAmountMap.set(lineItem.title, current + prorated);
      }
    }

    return Array.from(titleAmountMap.entries())
      .filter(([, amount]) => amount > 0)
      .map(([title, amount]) => ({ type: 'earning' as const, title, amount }));
  }

  /**
   * Build deduction line items from applicable deduction records.
   * For line items with specificMonth frequency, only include if their specificMonth matches the target month.
   * For monthly/yearly line items, include all.
   */
  private getDeductionLineItems(applicableDeductions: PayrollDeductionWithLineItemsType[], year: number, month: number): Array<{ type: 'deduction'; title: string; amount: number }> {
    const items: Array<{ type: 'deduction'; title: string; amount: number }> = [];
    for (const deduction of applicableDeductions) {
      for (const li of deduction.payrollDeductionLineItems) {
        if (li.frequency === 'specificMonth') {
          if (!li.specificMonth) continue;
          const sm = new Date(li.specificMonth);
          if (sm.getUTCFullYear() !== year || sm.getUTCMonth() + 1 !== month) continue;
        }
        items.push({
          type: 'deduction',
          title: li.type === 'other' ? (li.otherTitle ?? 'Other') : this.getDeductionLabel(li.type),
          amount: li.amount,
        });
      }
    }
    return items;
  }

  private async getApplicableDeductions(params: { userId: number; lastDay: Date; firstDay: Date; year: number; month: number; organizationId: number }): Promise<PayrollDeductionWithLineItemsType[]> {
    const allDeductions = await this.payrollDeductionDao.findByUserIdWithPagination({
      userId: params.userId,
      page: 1,
      limit: 1000,
      organizationId: params.organizationId,
    });

    return allDeductions.dbRecords.filter((d) => {
      if (!d.isActive) return false;

      const dFrom = new Date(d.effectiveFrom);
      dFrom.setUTCHours(0, 0, 0, 0);
      const dTill = d.effectiveTill ? new Date(d.effectiveTill) : null;
      if (dTill) dTill.setUTCHours(23, 59, 59, 999);

      const hasStarted = dFrom <= params.lastDay;
      const hasNotEnded = !dTill || dTill >= params.firstDay;

      return hasStarted && hasNotEnded;
    });
  }

  private async getCompensations(params: { userId: number; lastDay: Date; firstDay: Date; organizationId: number }): Promise<PayrollCompensationWithLineItemsType[]> {
    const allCompensations = await this.payrollCompensationDao.findByUserIdOrderedByEffectiveFromDesc({ userId: params.userId, organizationId: params.organizationId });
    return allCompensations.filter((c) => {
      const compFrom = new Date(c.effectiveFrom);
      compFrom.setUTCHours(0, 0, 0, 0);
      const compTill = c.effectiveTill ? new Date(c.effectiveTill) : null;
      if (compTill) compTill.setUTCHours(23, 59, 59, 999);

      return compFrom <= params.lastDay && (!compTill || compTill >= params.firstDay);
    });
  }

  private async deleteOldPayslips(params: { force: boolean | undefined; existingPayslips: PayslipListResponseType[]; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    if (params.force && params.existingPayslips.length > 0) {
      await Promise.all(params.existingPayslips.map((p) => this.payrollPayslipDao.deleteByIdOrThrow({ id: p.id, organizationId: params.organizationId, tx: params.tx })));
    }
  }

  private getDeductionLabel(type: string): string {
    const labels: Record<string, string> = {
      providentFund: 'Provident Fund',
      incomeTax: 'Income Tax',
      insurance: 'Insurance',
      professionalTax: 'Professional Tax',
      loan: 'Loan',
      lop: 'LOP',
    };
    return labels[type] ?? type;
  }
}
