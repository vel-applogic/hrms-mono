import { Injectable } from '@nestjs/common';
import type {
  EmployeeDeductionResponseType,
  EmployeeDeductionUpdateRequestType,
} from '@repo/dto';
import type { Prisma } from '@repo/db';
import {
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  UserEmployeeDeductionDao,
} from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import {
  parseDateOnly,
  parseMonthYearToFirstDay,
  validateEffectiveFromBeforeTill,
} from './_employee-deduction-validation.helper.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeDeductionUpdateRequestType;
};

@Injectable()
export class EmployeeDeductionUpdateUc implements IUseCase<Params, EmployeeDeductionResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeDeductionDao: UserEmployeeDeductionDao,
  ) {}

  async execute(params: Params): Promise<EmployeeDeductionResponseType> {
    this.logger.i('Updating employee deduction', { id: params.id });

    const existing = await this.userEmployeeDeductionDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Deduction not found', 404);
    }

    const newEffectiveFrom = params.dto.effectiveFrom ? parseDateOnly(params.dto.effectiveFrom) : existing.effectiveFrom;
    const newEffectiveTill =
      params.dto.effectiveTill !== undefined
        ? params.dto.effectiveTill
          ? parseDateOnly(params.dto.effectiveTill)
          : null
        : existing.effectiveTill;

    validateEffectiveFromBeforeTill(newEffectiveFrom, newEffectiveTill);

    const newType = params.dto.type ?? existing.type;
    const newFrequency = params.dto.frequency ?? existing.frequency;

    const resolvedOtherTitle = params.dto.otherTitle !== undefined ? params.dto.otherTitle : existing.otherTitle;
    if (newType === 'other' && !resolvedOtherTitle?.trim()) {
      throw new ApiError('Title is required when type is Other', 400);
    }
    const hasSpecificMonth =
      (params.dto.specificMonth != null && params.dto.specificMonth.trim().length > 0) || existing.specificMonth != null;
    if (newFrequency === 'specificMonth' && !hasSpecificMonth) {
      throw new ApiError('Specific month date is required when frequency is Specific Month', 400);
    }

    const updateData: Prisma.UserEmployeeDeductionUpdateInput = {};
    if (params.dto.type !== undefined) updateData.type = params.dto.type;
    if (params.dto.frequency !== undefined) updateData.frequency = params.dto.frequency;
    if (params.dto.amount !== undefined) updateData.amount = params.dto.amount;
    if (params.dto.type !== undefined && params.dto.type !== 'other') {
      updateData.otherTitle = null;
    } else if (params.dto.otherTitle !== undefined) {
      updateData.otherTitle = params.dto.otherTitle;
    }
    if (params.dto.frequency !== undefined && params.dto.frequency !== 'specificMonth') {
      updateData.specificMonth = null;
    } else if (params.dto.specificMonth !== undefined) {
      updateData.specificMonth = params.dto.specificMonth ? parseMonthYearToFirstDay(params.dto.specificMonth) : null;
    }
    if (params.dto.effectiveFrom !== undefined) updateData.effectiveFrom = parseDateOnly(params.dto.effectiveFrom);
    if (params.dto.effectiveTill !== undefined) updateData.effectiveTill = params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : null;
    if (params.dto.isActive !== undefined) updateData.isActive = params.dto.isActive;

    await this.userEmployeeDeductionDao.update({
      id: params.id,
      data: updateData,
    });

    const updated = await this.userEmployeeDeductionDao.getById({ id: params.id });
    if (!updated) throw new ApiError('Failed to fetch updated deduction', 500);

    return {
      id: updated.id,
      employeeId: updated.userId,
      type: updated.type,
      frequency: updated.frequency,
      amount: updated.amount,
      otherTitle: updated.otherTitle,
      specificMonth: updated.specificMonth?.toISOString().split('T')[0] ?? undefined,
      effectiveFrom: updated.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: updated.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
