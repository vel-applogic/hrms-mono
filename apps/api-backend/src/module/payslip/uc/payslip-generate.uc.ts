import { Injectable } from '@nestjs/common';
import type { UserEmployeeCompensation, UserEmployeeDeduction } from '@repo/db';
import type { PayslipGenerateRequestType, PayslipGenerateResponseType, PayslipListResponseType } from '@repo/dto';
import type { PayslipWithUserType } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, PayslipDao, UserEmployeeCompensationDao, UserEmployeeDeductionDao, UserEmployeeDetailDao } from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
  dto: PayslipGenerateRequestType;
};

@Injectable()
export class PayslipGenerateUc implements IUseCase<Params, PayslipGenerateResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payslipDao: PayslipDao,
    private readonly userEmployeeDetailDao: UserEmployeeDetailDao,
    private readonly userEmployeeCompensationDao: UserEmployeeCompensationDao,
    private readonly userEmployeeDeductionDao: UserEmployeeDeductionDao,
  ) {}

  async execute(params: Params): Promise<PayslipGenerateResponseType> {
    const { month, year, force, employeeIds } = params.dto;
    this.logger.i('Generating payslips', { month, year, employeeIds, force });

    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Determine which employees to generate for
    let targetUserIds: number[];
    if (employeeIds?.length) {
      targetUserIds = employeeIds;
    } else {
      const employees = await this.userEmployeeDetailDao.findAllWithUser();
      targetUserIds = employees.map((e) => e.userId);
    }

    // Check for existing payslips
    const existingPayslips = await this.payslipDao.findManyByMonthYear({
      month,
      year,
      employeeIds: targetUserIds,
    });

    if (existingPayslips.length > 0 && !force) {
      const existingResponses: PayslipListResponseType[] = existingPayslips.map((p: PayslipWithUserType) => ({
        id: p.id,
        employeeId: p.userId,
        employeeFirstname: p.user.firstname,
        employeeLastname: p.user.lastname,
        employeeEmail: p.user.email,
        month: p.month,
        year: p.year,
        grossAmount: p.grossAmount,
        netAmount: p.netAmount,
        deductionAmount: p.deductionAmount,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));

      return {
        generated: 0,
        skipped: existingPayslips.length,
        alreadyExisting: true,
        existingPayslips: existingResponses,
      };
    }

    // Delete existing payslips if force=true
    if (force && existingPayslips.length > 0) {
      for (const existing of existingPayslips) {
        await this.payslipDao.deleteById({ id: existing.id });
      }
    }

    let generated = 0;
    let skipped = 0;

    for (const userId of targetUserIds) {
      // Get all compensations for employee, find one valid for target month
      const compensations = await this.userEmployeeCompensationDao.findByUserIdOrderedByEffectiveFromDesc({ userId });
      const activeComp = compensations.find((c: UserEmployeeCompensation) => {
        const compFrom = new Date(c.effectiveFrom);
        compFrom.setUTCHours(0, 0, 0, 0);
        const compTill = c.effectiveTill ? new Date(c.effectiveTill) : null;
        if (compTill) compTill.setUTCHours(23, 59, 59, 999);

        const startsBeforeOrOnLastDay = compFrom <= lastDay;
        const endsAfterOrOnFirstDay = !compTill || compTill >= firstDay;
        return startsBeforeOrOnLastDay && endsAfterOrOnFirstDay;
      });

      if (!activeComp) {
        skipped++;
        continue;
      }

      // Get active deductions for this employee applicable for target month
      const allDeductions = await this.userEmployeeDeductionDao.findByUserIdWithPagination({
        userId,
        page: 1,
        limit: 1000,
      });

      const applicableDeductions = allDeductions.deductions.filter((d: UserEmployeeDeduction) => {
        if (!d.isActive) return false;

        const dFrom = new Date(d.effectiveFrom);
        dFrom.setUTCHours(0, 0, 0, 0);
        const dTill = d.effectiveTill ? new Date(d.effectiveTill) : null;
        if (dTill) dTill.setUTCHours(23, 59, 59, 999);

        const hasStarted = dFrom <= lastDay;
        const hasNotEnded = !dTill || dTill >= firstDay;

        if (d.frequency === 'specificMonth') {
          if (!d.specificMonth) return false;
          const sm = new Date(d.specificMonth);
          return sm.getUTCFullYear() === year && sm.getUTCMonth() + 1 === month;
        }

        if (d.frequency === 'yearly') {
          return dFrom.getUTCFullYear() <= year && (!dTill || dTill.getUTCFullYear() >= year);
        }

        // monthly
        return hasStarted && hasNotEnded;
      });

      // Build earnings line items from compensation
      const earningLineItems = [
        { type: 'earning' as const, title: 'Basic', amount: activeComp.basic },
        { type: 'earning' as const, title: 'HRA', amount: activeComp.hra },
        { type: 'earning' as const, title: 'Other Allowances', amount: activeComp.otherAllowances },
      ].filter((e) => e.amount > 0);

      // Build deduction line items
      const deductionLineItems = applicableDeductions.map((d: UserEmployeeDeduction) => ({
        type: 'deduction' as const,
        title: d.type === 'other' ? (d.otherTitle ?? 'Other') : this.getDeductionLabel(d.type),
        amount: d.amount,
      }));

      const grossAmount = earningLineItems.reduce((s, e) => s + e.amount, 0);
      const deductionAmount = deductionLineItems.reduce((s, d) => s + d.amount, 0);
      const netAmount = grossAmount - deductionAmount;

      await this.payslipDao.create({
        data: {
          user: { connect: { id: userId } },
          month,
          year,
          grossAmount,
          deductionAmount,
          netAmount,
          payslipLineItems: {
            create: [...earningLineItems, ...deductionLineItems],
          },
        },
      });

      generated++;
    }

    return { generated, skipped, alreadyExisting: false };
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
