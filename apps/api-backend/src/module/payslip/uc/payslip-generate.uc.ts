import { Injectable } from '@nestjs/common';
import type { UserEmployeeCompensation, UserEmployeeDeduction } from '@repo/db';
import { Prisma } from '@repo/db';
import type { PayslipGenerateRequestType, PayslipGenerateResponseType, PayslipListResponseType } from '@repo/dto';
import { PrismaService } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, LeaveDao, PayslipDao, UserEmployeeCompensationDao, UserEmployeeDeductionDao, UserEmployeeDetailDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

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
    private readonly payslipDao: PayslipDao,
    private readonly userEmployeeDetailDao: UserEmployeeDetailDao,
    private readonly userEmployeeCompensationDao: UserEmployeeCompensationDao,
    private readonly userEmployeeDeductionDao: UserEmployeeDeductionDao,
    private readonly leaveDao: LeaveDao,
  ) {
    super(prisma, logger);
  }

  async execute(params: Params): Promise<PayslipGenerateResponseType> {
    const { month, year, force, employeeIds } = params.dto;
    this.logger.i('Generating payslips', { month, year, employeeIds, force });

    const { existingPayslips, targetUserIds } = await this.validate(params);

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

    // start transaction
    await this.transaction(async (tx) => {
      await this.deleteOldPayslips({ force, existingPayslips, tx });
      for (const userId of targetUserIds) {
        // get compensations
        const overlappingComps = await this.getCompensations({ userId, lastDay, firstDay });
        if (overlappingComps.length === 0) {
          skipped++;
          continue;
        }

        // Only the latest compensation (the one open-ended) may have no effectiveTill
        const openEndedComps = overlappingComps.filter((c: UserEmployeeCompensation) => !c.effectiveTill);
        if (openEndedComps.length > 1) {
          throw new ApiBadRequestError(`Employee ${userId} has ${openEndedComps.length} compensations with no end date. Only the latest compensation can have no end date.`);
        }

        // get deductions
        const applicableDeductions = await this.getApplicableDeductions({ userId, lastDay, firstDay, year, month });

        const { totalBasic, totalHra, totalOtherAllowances, totalGross } = this.getSalaryComponents({ overlappingComps, firstDay, totalDaysInMonth, year, month });

        // Build earnings line items from pro-rated compensation totals
        const earningLineItems = [
          { type: 'earning' as const, title: 'Basic', amount: totalBasic },
          { type: 'earning' as const, title: 'HRA', amount: totalHra },
          { type: 'earning' as const, title: 'Other Allowances', amount: totalOtherAllowances },
        ].filter((e) => e.amount > 0);

        // Build deduction line items
        const deductionLineItems = applicableDeductions.map((d: UserEmployeeDeduction) => ({
          type: 'deduction' as const,
          title: d.type === 'other' ? (d.otherTitle ?? 'Other') : this.getDeductionLabel(d.type),
          amount: d.amount,
        }));

        // Add LOP deduction based on approved leaves with numberOfLopDays in the target month
        const lopDaysCount = await this.leaveDao.sumLopDaysByUserIdAndDateRange({
          userId,
          startDate: firstDay,
          endDate: lastDay,
        });
        const lopAmount = lopDaysCount > 0 ? Math.round((totalGross / totalDaysInMonth) * lopDaysCount) : 0;
        deductionLineItems.push({ type: 'deduction' as const, title: 'Loss of Pay', amount: lopAmount });

        const grossAmount = earningLineItems.reduce((s, e) => s + e.amount, 0);
        const deductionAmount = deductionLineItems.reduce((s, d) => s + d.amount, 0);
        const netAmount = grossAmount - deductionAmount;

        await this.createPayslip({ userId, month, year, grossAmount, deductionAmount, netAmount, earningLineItems, deductionLineItems, tx });
        generated++;
      }
    });

    return { generated, skipped, alreadyExisting: false };
  }

  private async validate(params: Params): Promise<{ existingPayslips: PayslipListResponseType[]; targetUserIds: number[] }> {
    // check employee ids
    let targetUserIds: number[];
    if (params.dto.employeeIds?.length) {
      targetUserIds = params.dto.employeeIds;
    } else {
      const employees = await this.userEmployeeDetailDao.findAllWithUser();
      targetUserIds = employees.map((e) => e.userId);
    }

    if (targetUserIds.length === 0) {
      throw new ApiBadRequestError('No employees found to generate payslips');
    }

    // Check for existing payslips
    const dbExistingPayslips = await this.payslipDao.findManyByMonthYear({
      month: params.dto.month,
      year: params.dto.year,
      employeeIds: targetUserIds,
    });

    const existingPayslips = dbExistingPayslips.map((p) => this.dbToPayslipListResponse(p));
    return { existingPayslips, targetUserIds };
  }

  private async createPayslip(params: {
    userId: number;
    month: number;
    year: number;
    grossAmount: number;
    deductionAmount: number;
    netAmount: number;
    earningLineItems: Prisma.PayslipLineItemCreateWithoutPayslipInput[];
    deductionLineItems: Prisma.PayslipLineItemCreateWithoutPayslipInput[];
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    await this.payslipDao.create({
      tx: params.tx,
      data: {
        user: { connect: { id: params.userId } },
        month: params.month,
        year: params.year,
        grossAmount: params.grossAmount,
        deductionAmount: params.deductionAmount,
        netAmount: params.netAmount,
        payslipLineItems: {
          create: [...params.earningLineItems, ...params.deductionLineItems],
        },
      },
    });
  }

  // Calculate pro-rated earnings from each overlapping compensation
  // Values in DB are yearly; monthly = value / 12, then pro-rated by active calendar days
  private getSalaryComponents(params: { overlappingComps: UserEmployeeCompensation[]; firstDay: Date; totalDaysInMonth: number; year: number; month: number }): {
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

  private async getApplicableDeductions(params: { userId: number; lastDay: Date; firstDay: Date; year: number; month: number }): Promise<UserEmployeeDeduction[]> {
    // Get active deductions for this employee applicable for target month
    const allDeductions = await this.userEmployeeDeductionDao.findByUserIdWithPagination({
      userId: params.userId,
      page: 1,
      limit: 1000,
    });

    const applicableDeductions = allDeductions.deductions.filter((d: UserEmployeeDeduction) => {
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

      // monthly
      return hasStarted && hasNotEnded;
    });
    return applicableDeductions;
  }

  // Get all compensations for employee overlapping with target month (ignore isActive)
  private async getCompensations(params: { userId: number; lastDay: Date; firstDay: Date }): Promise<UserEmployeeCompensation[]> {
    const allCompensations = await this.userEmployeeCompensationDao.findByUserIdOrderedByEffectiveFromDesc({ userId: params.userId });
    const overlappingComps = allCompensations.filter((c: UserEmployeeCompensation) => {
      const compFrom = new Date(c.effectiveFrom);
      compFrom.setUTCHours(0, 0, 0, 0);
      const compTill = c.effectiveTill ? new Date(c.effectiveTill) : null;
      if (compTill) compTill.setUTCHours(23, 59, 59, 999);

      return compFrom <= params.lastDay && (!compTill || compTill >= params.firstDay);
    });
    return overlappingComps;
  }

  // Delete existing payslips if force=true
  private async deleteOldPayslips(params: { force: boolean | undefined; existingPayslips: PayslipListResponseType[]; tx: Prisma.TransactionClient }): Promise<void> {
    if (params.force && params.existingPayslips.length > 0) {
      await Promise.all(params.existingPayslips.map((p) => this.payslipDao.deleteById({ id: p.id, tx: params.tx })));
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
