import { Injectable } from '@nestjs/common';
import type { EmployeeDeductionCreateRequestType, EmployeeDeductionResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, PayrollDeductionDao, EmployeeDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { parseDateOnly, parseMonthYearToFirstDay, validateEffectiveFromBeforeTill } from './_employee-deduction-validation.helper.js';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeDeductionCreateRequestType;
};

@Injectable()
export class EmployeeDeductionCreateUc implements IUseCase<Params, EmployeeDeductionResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly prisma: PrismaService,
    private readonly employeeDao: EmployeeDao,
    private readonly payrollDeductionDao: PayrollDeductionDao,
  ) {}

  async execute(params: Params): Promise<EmployeeDeductionResponseType> {
    this.logger.i('Creating employee deduction', { employeeId: params.dto.employeeId });

    const employee = await this.employeeDao.getByUserId({ userId: params.dto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const effectiveFrom = parseDateOnly(params.dto.effectiveFrom);
    const effectiveTill = params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : null;
    validateEffectiveFromBeforeTill(effectiveFrom, effectiveTill);

    if (params.dto.frequency === 'specificMonth') {
      if (!params.dto.specificMonth?.trim()) {
        throw new ApiError('Specific month date is required when frequency is Specific Month', 400);
      }
    }
    if (params.dto.type === 'other') {
      if (!params.dto.otherTitle?.trim()) {
        throw new ApiError('Title is required when type is Other', 400);
      }
    }

    // Check for existing active deductions of the same type
    const existingActive = await this.payrollDeductionDao.findActiveByUserIdAndType({
      userId: params.dto.employeeId,
      organizationId: params.currentUser.organizationId,
      type: params.dto.type,
    });

    for (const existing of existingActive) {
      const existingFrom = new Date(existing.effectiveFrom);
      existingFrom.setUTCHours(0, 0, 0, 0);
      const newFrom = new Date(effectiveFrom);
      newFrom.setUTCHours(0, 0, 0, 0);

      if (newFrom <= existingFrom) {
        throw new ApiError(
          `A ${params.dto.type} deduction already exists effective from ${existingFrom.toISOString().split('T')[0]}. New effective from must be after that date.`,
          400,
        );
      }
    }

    const specificMonth =
      params.dto.frequency === 'specificMonth' && params.dto.specificMonth
        ? parseMonthYearToFirstDay(params.dto.specificMonth)
        : undefined;

    // One day before new effectiveFrom
    const prevEffectiveTill = new Date(effectiveFrom);
    prevEffectiveTill.setUTCDate(prevEffectiveTill.getUTCDate() - 1);

    const createdId = await this.prisma.$transaction(async (tx) => {
      // Deactivate all previous active deductions of same type
      for (const existing of existingActive) {
        await this.payrollDeductionDao.update({
          id: existing.id,
          data: { isActive: false, effectiveTill: prevEffectiveTill },
          tx,
        });
      }

      return this.payrollDeductionDao.create({
        data: {
          user: { connect: { id: params.dto.employeeId } },
          organization: { connect: { id: params.currentUser.organizationId } },
          type: params.dto.type,
          frequency: params.dto.frequency,
          amount: params.dto.amount,
          otherTitle: params.dto.type === 'other' ? (params.dto.otherTitle ?? undefined) : undefined,
          specificMonth,
          effectiveFrom,
          effectiveTill: effectiveTill ?? undefined,
          isActive: params.dto.isActive ?? true,
        },
        tx,
      });
    });

    const created = await this.payrollDeductionDao.getById({ id: createdId, organizationId: params.currentUser.organizationId });
    if (!created) throw new ApiError('Failed to fetch created deduction', 500);

    return {
      id: created.id,
      employeeId: created.userId,
      type: created.type,
      frequency: created.frequency,
      amount: created.amount,
      otherTitle: created.otherTitle,
      specificMonth: created.specificMonth?.toISOString().split('T')[0] ?? undefined,
      effectiveFrom: created.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: created.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}
