import { Injectable } from '@nestjs/common';
import type { EmployeeDeductionResponseType, EmployeeDeductionUpdateRequestType } from '@repo/dto';
import type { Prisma } from '@repo/db';
import { CommonLoggerService, CurrentUserType, IUseCase, PayrollDeductionDao, PrismaService } from '@repo/nest-lib';
import type { PayrollDeductionWithLineItemsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { parseDateOnly, parseMonthYearToFirstDay, validateEffectiveFromBeforeTill } from './_employee-deduction-validation.helper.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeDeductionUpdateRequestType;
};

@Injectable()
export class EmployeeDeductionUpdateUc implements IUseCase<Params, EmployeeDeductionResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly payrollDeductionDao: PayrollDeductionDao,
  ) {}

  async execute(params: Params): Promise<EmployeeDeductionResponseType> {
    this.logger.i('Updating employee deduction', { id: params.id });

    const existing = await this.payrollDeductionDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
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

    const updateData: Prisma.PayrollDeductionUpdateInput = {};
    if (params.dto.effectiveFrom !== undefined) updateData.effectiveFrom = parseDateOnly(params.dto.effectiveFrom);
    if (params.dto.effectiveTill !== undefined) updateData.effectiveTill = params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : null;
    if (params.dto.isActive !== undefined) updateData.isActive = params.dto.isActive;

    await this.prisma.$transaction(async (tx) => {
      await this.payrollDeductionDao.update({
        id: params.id,
        data: updateData,
        tx,
      });

      if (params.dto.lineItems) {
        await this.payrollDeductionDao.replaceLineItems({
          deductionId: params.id,
          lineItems: params.dto.lineItems.map((item) => ({
            type: item.type,
            frequency: item.frequency,
            amount: item.amount,
            otherTitle: item.type === 'other' ? (item.otherTitle ?? null) : null,
            specificMonth: item.frequency === 'specificMonth' && item.specificMonth ? parseMonthYearToFirstDay(item.specificMonth) : null,
          })),
          tx,
        });
      }
    });

    const updated = await this.payrollDeductionDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!updated) throw new ApiError('Failed to fetch updated deduction', 500);

    return this.mapToResponse(updated);
  }

  private mapToResponse(d: PayrollDeductionWithLineItemsType): EmployeeDeductionResponseType {
    return {
      id: d.id,
      employeeId: d.userId,
      effectiveFrom: d.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: d.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: d.isActive,
      lineItems: d.payrollDeductionLineItems.map((li) => ({
        id: li.id,
        type: li.type,
        frequency: li.frequency,
        amount: li.amount,
        otherTitle: li.otherTitle,
        specificMonth: li.specificMonth?.toISOString().split('T')[0] ?? undefined,
      })),
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    };
  }
}
