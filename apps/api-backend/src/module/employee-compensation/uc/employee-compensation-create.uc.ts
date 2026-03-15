import { Injectable } from '@nestjs/common';
import type { EmployeeCompensationCreateRequestType, EmployeeCompensationResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserEmployeeCompensationDao, UserEmployeeDetailDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { parseDateOnly, validateEffectiveFromNoOverlap } from './_employee-compensation-validation.helper.js';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeCompensationCreateRequestType;
};

type ValidateResult = {
  newEffectiveFrom: Date;
  mostRecent: { id: number; effectiveFrom: Date; effectiveTill: Date | null } | undefined;
};

@Injectable()
export class EmployeeCompensationCreateUc implements IUseCase<Params, EmployeeCompensationResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeDetailDao: UserEmployeeDetailDao,
    private readonly userEmployeeCompensationDao: UserEmployeeCompensationDao,
  ) {}

  async execute(params: Params): Promise<EmployeeCompensationResponseType> {
    this.logger.i('Creating employee compensation', { employeeId: params.dto.employeeId });

    const { newEffectiveFrom, mostRecent } = await this.validate(params);

    const created = await this.prisma.$transaction(async (tx) => {
      if (mostRecent) {
        const mostRecentFrom = new Date(mostRecent.effectiveFrom);
        mostRecentFrom.setUTCHours(0, 0, 0, 0);
        if (newEffectiveFrom >= mostRecentFrom) {
          const oneDayBefore = new Date(newEffectiveFrom);
          oneDayBefore.setUTCDate(oneDayBefore.getUTCDate() - 1);
          await this.userEmployeeCompensationDao.update({
            id: mostRecent.id,
            data: { effectiveTill: oneDayBefore, isActive: false },
            tx,
          });
        }
      }

      await this.userEmployeeCompensationDao.updateManyByUserId({
        userId: params.dto.employeeId,
        data: { isActive: false },
        tx,
      });

      return this.userEmployeeCompensationDao.create({
        data: {
          user: { connect: { id: params.dto.employeeId } },
          basic: params.dto.basic,
          hra: params.dto.hra,
          otherAllowances: params.dto.otherAllowances,
          gross: params.dto.gross,
          effectiveFrom: newEffectiveFrom,
          effectiveTill: params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : undefined,
          isActive: true,
        },
        tx,
      });
    });

    return {
      id: created.id,
      employeeId: created.userId,
      basic: created.basic,
      hra: created.hra,
      otherAllowances: created.otherAllowances,
      gross: created.gross,
      effectiveFrom: created.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: created.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  private async validate(params: Params): Promise<ValidateResult> {
    const employee = await this.userEmployeeDetailDao.getByUserId({ userId: params.dto.employeeId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const newEffectiveFrom = parseDateOnly(params.dto.effectiveFrom);

    const existing = await this.userEmployeeCompensationDao.findByUserIdOrderedByEffectiveFromDesc({
      userId: params.dto.employeeId,
    });

    const mostRecent = existing[0];
    const compsToCheck = mostRecent ? existing.slice(1) : existing;

    validateEffectiveFromNoOverlap(newEffectiveFrom, compsToCheck);

    return {
      newEffectiveFrom,
      mostRecent: mostRecent ? { id: mostRecent.id, effectiveFrom: mostRecent.effectiveFrom, effectiveTill: mostRecent.effectiveTill } : undefined,
    };
  }
}
