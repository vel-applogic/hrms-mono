import { Injectable } from '@nestjs/common';
import type { EmployeeCompensationResponseType, EmployeeCompensationUpdateRequestType } from '@repo/dto';
import type { Prisma } from '@repo/db';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, PayrollCompensationDao } from '@repo/nest-lib';
import type { PayrollCompensationWithLineItemsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { parseDateOnly, validateEffectiveFromBeforeTill, validateEffectiveRangeNoOverlap } from './_employee-compensation-validation.helper.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeCompensationUpdateRequestType;
};

type ValidateResult = {
  newEffectiveFrom: Date;
  effectiveFromChanged: boolean;
  mostRecent: { id: number; effectiveFrom: Date; effectiveTill: Date | null } | undefined;
};

@Injectable()
export class EmployeeCompensationUpdateUc implements IUseCase<Params, EmployeeCompensationResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly payrollCompensationDao: PayrollCompensationDao,
  ) {}

  async execute(params: Params): Promise<EmployeeCompensationResponseType> {
    this.logger.i('Updating employee compensation', { id: params.id });

    const { newEffectiveFrom, effectiveFromChanged, mostRecent } = await this.validate(params);

    await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.PayrollCompensationUpdateInput = {
        effectiveFrom: params.dto.effectiveFrom ? parseDateOnly(params.dto.effectiveFrom) : undefined,
        effectiveTill: params.dto.effectiveTill !== undefined ? (params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : null) : undefined,
        isActive: params.dto.isActive,
      };

      if (effectiveFromChanged && mostRecent) {
        const mostRecentFrom = new Date(mostRecent.effectiveFrom);
        mostRecentFrom.setUTCHours(0, 0, 0, 0);
        if (newEffectiveFrom >= mostRecentFrom) {
          const oneDayBefore = new Date(newEffectiveFrom);
          oneDayBefore.setUTCDate(oneDayBefore.getUTCDate() - 1);
          const prevTill = mostRecent.effectiveTill ? new Date(mostRecent.effectiveTill) : null;
          if (!prevTill || prevTill > oneDayBefore) {
            await this.payrollCompensationDao.update({
              id: mostRecent.id,
              data: { effectiveTill: oneDayBefore, isActive: false },
              tx,
            });
          }
        }
      }

      await this.payrollCompensationDao.update({
        id: params.id,
        data: updateData,
        tx,
      });

      if (params.dto.lineItems) {
        const grossAmount = params.dto.lineItems.reduce((sum, item) => sum + item.amount, 0);
        await this.payrollCompensationDao.replaceLineItems({
          compensationId: params.id,
          lineItems: params.dto.lineItems.map((item) => ({ title: item.title, amount: item.amount })),
          grossAmount,
          tx,
        });
      }
    });

    const updated = await this.payrollCompensationDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!updated) throw new ApiError('Failed to fetch updated compensation', 500);

    return this.mapToResponse(updated);
  }

  private async validate(params: Params): Promise<ValidateResult> {
    const existing = await this.payrollCompensationDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Compensation not found', 404);
    }

    const newEffectiveFrom = params.dto.effectiveFrom ? parseDateOnly(params.dto.effectiveFrom) : existing.effectiveFrom;
    const newEffectiveTill = params.dto.effectiveTill !== undefined ? (params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : null) : existing.effectiveTill;

    validateEffectiveFromBeforeTill(newEffectiveFrom, newEffectiveTill);

    const allForUser = await this.payrollCompensationDao.findByUserIdOrderedByEffectiveFromDesc({
      userId: existing.userId,
      organizationId: params.currentUser.organizationId,
    });
    const others = allForUser.filter((c) => c.id !== params.id);
    const mostRecent = others[0];

    validateEffectiveRangeNoOverlap(newEffectiveFrom, newEffectiveTill, others);

    return {
      newEffectiveFrom,
      effectiveFromChanged: !!params.dto.effectiveFrom,
      mostRecent: mostRecent ? { id: mostRecent.id, effectiveFrom: mostRecent.effectiveFrom, effectiveTill: mostRecent.effectiveTill } : undefined,
    };
  }

  private mapToResponse(c: PayrollCompensationWithLineItemsType): EmployeeCompensationResponseType {
    return {
      id: c.id,
      employeeId: c.userId,
      grossAmount: c.grossAmount,
      effectiveFrom: c.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: c.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: c.isActive,
      lineItems: c.payrollCompensationLineItems.map((li) => ({
        id: li.id,
        title: li.title,
        amount: li.amount,
      })),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}
