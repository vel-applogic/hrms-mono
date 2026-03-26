import { Injectable } from '@nestjs/common';
import type { PayrollCompensation, PayrollDeduction } from '@repo/db';
import { Prisma } from '@repo/db';
import type { PayslipDetailResponseType, PayslipGenerateRequestType, PayslipGenerateResponseType, PayslipListResponseType } from '@repo/dto';
import { PrismaService } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, LeaveDao, PayrollPayslipDao, PayrollCompensationDao, PayrollDeductionDao, EmployeeDao } from '@repo/nest-lib';
import type { PayrollPayslipWithDetailsType } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';
import { buildPayslipTemplateData } from '@repo/shared';

import { S3Service } from '../../../external-service/s3.service.js';
import { PdfGeneratorService } from '../../../service/pdf/pdf-generator.service.js';
import { BasePayslipUc } from './_base-payslip.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: PayslipGenerateRequestType;
};

@Injectable()
export class PayslipGenerateUc extends BasePayslipUc implements IUseCase<Params, PayslipGenerateResponseType> {
  constructor(
    logger: CommonLoggerService,
    prisma: PrismaService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly employeeDao: EmployeeDao,
    private readonly payrollCompensationDao: PayrollCompensationDao,
    private readonly payrollDeductionDao: PayrollDeductionDao,
    private readonly leaveDao: LeaveDao,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  async execute(params: Params): Promise<PayslipGenerateResponseType> {
    const { month, year, force, employeeIds } = params.dto;
    this.logger.i('Generating payslips', { month, year, employeeIds, force });

    const { existingPayslips, targetUserIds } = await this.validate(params, params.currentUser.organizationId);

    // return if payslips already exist and force is not true
    if (existingPayslips.length > 0 && !force) {
      return {
        generated: 0,
        skipped: existingPayslips.length,
        alreadyExisting: true,
        existingPayslips,
      };
    }

    let generated = 0;
    let skipped = 0;
    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const totalDaysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    // Fetch user names to compute deterministic S3 keys before the transaction
    const users = await this.prisma.user.findMany({
      where: { id: { in: targetUserIds } },
      select: { id: true, firstname: true, lastname: true },
    });
    const userNameMap = new Map(users.map((u) => [u.id, { firstname: u.firstname, lastname: u.lastname }]));

    const createdPayslips: PayrollPayslipWithDetailsType[] = [];

    await this.transaction(async (tx) => {
      const organizationId = params.currentUser.organizationId;
      await this.deleteOldPayslips({ force, existingPayslips, organizationId, tx });

      for (const userId of targetUserIds) {
        const overlappingComps = await this.getCompensations({ userId, lastDay, firstDay, organizationId });
        if (overlappingComps.length === 0) {
          skipped++;
          continue;
        }

        // Only the latest compensation (the one open-ended) may have no effectiveTill
        const openEndedComps = overlappingComps.filter((c: PayrollCompensation) => !c.effectiveTill);
        if (openEndedComps.length > 1) {
          throw new ApiBadRequestError(`Employee ${userId} has ${openEndedComps.length} compensations with no end date. Only the latest compensation can have no end date.`);
        }

        const applicableDeductions = await this.getApplicableDeductions({ userId, lastDay, firstDay, year, month, organizationId });

        const { totalBasic, totalHra, totalOtherAllowances, totalGross } = this.getSalaryComponents({ overlappingComps, firstDay, totalDaysInMonth, year, month });

        const earningLineItems = [
          { type: 'earning' as const, title: 'Basic', amount: totalBasic },
          { type: 'earning' as const, title: 'HRA', amount: totalHra },
          { type: 'earning' as const, title: 'Other Allowances', amount: totalOtherAllowances },
        ].filter((e) => e.amount > 0);

        const deductionLineItems = applicableDeductions.map((d: PayrollDeduction) => ({
          type: 'deduction' as const,
          title: d.type === 'other' ? (d.otherTitle ?? 'Other') : this.getDeductionLabel(d.type),
          amount: d.amount,
        }));

        const lopDaysCount = await this.leaveDao.sumLopDaysByUserIdAndDateRange({ userId, startDate: firstDay, endDate: lastDay, organizationId });
        const lopAmount = lopDaysCount > 0 ? Math.round((totalGross / totalDaysInMonth) * lopDaysCount) : 0;
        deductionLineItems.push({ type: 'deduction' as const, title: 'Loss of Pay', amount: lopAmount });

        const grossAmount = earningLineItems.reduce((s, e) => s + e.amount, 0);
        const deductionAmount = deductionLineItems.reduce((s, d) => s + d.amount, 0);
        const netAmount = grossAmount - deductionAmount;

        const userName = userNameMap.get(userId);
        const s3Key = this.buildS3Key({ userId, firstname: userName?.firstname ?? '', lastname: userName?.lastname ?? '', month, year });

        const created = await this.createPayslip({ userId, organizationId, month, year, grossAmount, deductionAmount, netAmount, earningLineItems, deductionLineItems, s3Key, tx });
        createdPayslips.push(created);
        generated++;
      }
    });

    // Generate PDFs and upload to S3 in parallel after the transaction
    await Promise.all(createdPayslips.map((p) => this.generateAndUploadPdf(p)));

    return { generated, skipped, alreadyExisting: false };
  }

  private async generateAndUploadPdf(payslip: PayrollPayslipWithDetailsType): Promise<void> {
    try {
      const pdfData = buildPayslipTemplateData(this.mapToDetail(payslip));
      const pdfBuffer = await this.pdfGeneratorService.generatePayslipPdf(pdfData);
      await this.s3Service.uploadBuffer({ s3Key: payslip.pdfS3Key, buffer: pdfBuffer, contentType: 'application/pdf' });
    } catch (err) {
      this.logger.e('Failed to generate/upload payslip PDF', { payslipId: payslip.id, error: err });
    }
  }

  private buildS3Key(params: { userId: number; firstname: string; lastname: string; month: number; year: number }): string {
    const name = `${params.firstname}_${params.lastname}`.replace(/\s+/g, '_');
    return `user/${params.userId}/payslip-${name}-${params.month}-${params.year}.pdf`;
  }

  private mapToDetail(p: PayrollPayslipWithDetailsType): PayslipDetailResponseType {
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
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
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

  private async validate(params: Params, organizationId: number): Promise<{ existingPayslips: PayslipListResponseType[]; targetUserIds: number[] }> {
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

    const existingPayslips = dbExistingPayslips.map((p) => this.dbToPayslipListResponse(p));
    return { existingPayslips, targetUserIds };
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
  }): Promise<PayrollPayslipWithDetailsType> {
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

  // Calculate pro-rated earnings from each overlapping compensation
  // Values in DB are yearly; monthly = value / 12, then pro-rated by active calendar days
  private getSalaryComponents(params: { overlappingComps: PayrollCompensation[]; firstDay: Date; totalDaysInMonth: number; year: number; month: number }): {
    totalBasic: number;
    totalHra: number;
    totalOtherAllowances: number;
    totalGross: number;
  } {
    let totalBasic = 0;
    let totalHra = 0;
    let totalOtherAllowances = 0;
    let totalGross = 0;

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

      totalBasic += Math.round((comp.basic / 12) * prorataFactor);
      totalHra += Math.round((comp.hra / 12) * prorataFactor);
      totalOtherAllowances += Math.round((comp.otherAllowances / 12) * prorataFactor);
      totalGross += Math.round((comp.gross / 12) * prorataFactor);
    }

    return { totalBasic, totalHra, totalOtherAllowances, totalGross };
  }

  private async getApplicableDeductions(params: { userId: number; lastDay: Date; firstDay: Date; year: number; month: number; organizationId: number }): Promise<PayrollDeduction[]> {
    const allDeductions = await this.payrollDeductionDao.findByUserIdWithPagination({
      userId: params.userId,
      page: 1,
      limit: 1000,
      organizationId: params.organizationId,
    });

    return allDeductions.deductions.filter((d: PayrollDeduction) => {
      if (!d.isActive) return false;

      const dFrom = new Date(d.effectiveFrom);
      dFrom.setUTCHours(0, 0, 0, 0);
      const dTill = d.effectiveTill ? new Date(d.effectiveTill) : null;
      if (dTill) dTill.setUTCHours(23, 59, 59, 999);

      const hasStarted = dFrom <= params.lastDay;
      const hasNotEnded = !dTill || dTill >= params.firstDay;

      if (d.frequency === 'specificMonth') {
        if (!d.specificMonth) return false;
        const sm = new Date(d.specificMonth);
        return sm.getUTCFullYear() === params.year && sm.getUTCMonth() + 1 === params.month;
      }

      if (d.frequency === 'yearly') {
        return dFrom.getUTCFullYear() <= params.year && (!dTill || dTill.getUTCFullYear() >= params.year);
      }

      return hasStarted && hasNotEnded;
    });
  }

  private async getCompensations(params: { userId: number; lastDay: Date; firstDay: Date; organizationId: number }): Promise<PayrollCompensation[]> {
    const allCompensations = await this.payrollCompensationDao.findByUserIdOrderedByEffectiveFromDesc({ userId: params.userId, organizationId: params.organizationId });
    return allCompensations.filter((c: PayrollCompensation) => {
      const compFrom = new Date(c.effectiveFrom);
      compFrom.setUTCHours(0, 0, 0, 0);
      const compTill = c.effectiveTill ? new Date(c.effectiveTill) : null;
      if (compTill) compTill.setUTCHours(23, 59, 59, 999);

      return compFrom <= params.lastDay && (!compTill || compTill >= params.firstDay);
    });
  }

  private async deleteOldPayslips(params: { force: boolean | undefined; existingPayslips: PayslipListResponseType[]; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    if (params.force && params.existingPayslips.length > 0) {
      await Promise.all(params.existingPayslips.map((p) => this.payrollPayslipDao.deleteById({ id: p.id, organizationId: params.organizationId, tx: params.tx })));
    }
  }

  private getDeductionLabel(type: string): string {
    const labels: Record<string, string> = {
      providentFund: 'Provident Fund',
      incomeTax: 'Income Tax',
      insurance: 'Insurance',
      professionalTax: 'Professional Tax',
      loan: 'Loan',
    };
    return labels[type] ?? type;
  }
}
