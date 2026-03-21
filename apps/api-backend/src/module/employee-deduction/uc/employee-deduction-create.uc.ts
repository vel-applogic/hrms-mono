import { Injectable } from '@nestjs/common';
import type { EmployeeDeductionCreateRequestType, EmployeeDeductionResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, UserEmployeeDeductionDao, UserEmployeeDetailDao } from '@repo/nest-lib';
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
    private readonly userEmployeeDetailDao: UserEmployeeDetailDao,
    private readonly userEmployeeDeductionDao: UserEmployeeDeductionDao,
  ) {}

  async execute(params: Params): Promise<EmployeeDeductionResponseType> {
    this.logger.i('Creating employee deduction', { employeeId: params.dto.employeeId });

    const employee = await this.userEmployeeDetailDao.getByUserId({ userId: params.dto.employeeId });
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

    const specificMonth = params.dto.frequency === 'specificMonth' && params.dto.specificMonth ? parseMonthYearToFirstDay(params.dto.specificMonth) : undefined;

    const created = await this.userEmployeeDeductionDao.create({
      data: {
        user: { connect: { id: params.dto.employeeId } },
        type: params.dto.type,
        frequency: params.dto.frequency,
        amount: params.dto.amount,
        otherTitle: params.dto.type === 'other' ? (params.dto.otherTitle ?? undefined) : undefined,
        specificMonth,
        effectiveFrom,
        effectiveTill: effectiveTill ?? undefined,
        isActive: params.dto.isActive ?? true,
      },
    });

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
