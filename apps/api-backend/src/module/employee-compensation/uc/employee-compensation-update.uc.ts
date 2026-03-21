import { Injectable } from '@nestjs/common';
import type { EmployeeCompensationResponseType, EmployeeCompensationUpdateRequestType } from '@repo/dto';
import type { Prisma } from '@repo/db';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserEmployeeCompensationDao } from '@repo/nest-lib';
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
    private readonly userEmployeeCompensationDao: UserEmployeeCompensationDao,
  ) {}

  async execute(params: Params): Promise<EmployeeCompensationResponseType> {
    this.logger.i('Updating employee compensation', { id: params.id });

    const { newEffectiveFrom, effectiveFromChanged, mostRecent } = await this.validate(params);

    const updated = await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.UserEmployeeCompensationUpdateInput = {
        basic: params.dto.basic,
        hra: params.dto.hra,
        otherAllowances: params.dto.otherAllowances,
        gross: params.dto.gross,
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
            await this.userEmployeeCompensationDao.update({
              id: mostRecent.id,
              data: { effectiveTill: oneDayBefore, isActive: false },
              tx,
            });
          }
        }
      }

      await this.userEmployeeCompensationDao.update({
        id: params.id,
        data: updateData,
        tx,
      });

      return this.userEmployeeCompensationDao.getById({ id: params.id, tx });
    });

    if (!updated) throw new ApiError('Failed to fetch updated compensation', 500);

    return {
      id: updated.id,
      employeeId: updated.userId,
      basic: updated.basic,
      hra: updated.hra,
      otherAllowances: updated.otherAllowances,
      gross: updated.gross,
      effectiveFrom: updated.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: updated.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  private async validate(params: Params): Promise<ValidateResult> {
    const existing = await this.userEmployeeCompensationDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Compensation not found', 404);
    }

    const newEffectiveFrom = params.dto.effectiveFrom ? parseDateOnly(params.dto.effectiveFrom) : existing.effectiveFrom;
    const newEffectiveTill = params.dto.effectiveTill !== undefined ? (params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : null) : existing.effectiveTill;

    validateEffectiveFromBeforeTill(newEffectiveFrom, newEffectiveTill);

    const allForUser = await this.userEmployeeCompensationDao.findByUserIdOrderedByEffectiveFromDesc({
      userId: existing.userId,
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
}
