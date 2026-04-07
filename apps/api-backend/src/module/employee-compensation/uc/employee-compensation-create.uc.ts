import { Injectable } from '@nestjs/common';
import type { EmployeeCompensationCreateRequestType, EmployeeCompensationResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, PayrollCompensationDao, EmployeeDao } from '@repo/nest-lib';
import type { PayrollCompensationWithLineItemsType } from '@repo/nest-lib';
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
export class EmployeeCompensationCreateUc extends BaseUc implements IUseCase<Params, EmployeeCompensationResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly payrollCompensationDao: PayrollCompensationDao,
  ) {
    super(prisma, logger);
  }

  async execute(params: Params): Promise<EmployeeCompensationResponseType> {
    this.logger.i('Creating employee compensation', { employeeId: params.dto.employeeId });

    const { newEffectiveFrom, mostRecent } = await this.validate(params);
    const grossAmount = params.dto.lineItems.reduce((sum, item) => sum + item.amount, 0);

    const createdId = await this.prisma.$transaction(async (tx) => {
      if (mostRecent) {
        const mostRecentFrom = new Date(mostRecent.effectiveFrom);
        mostRecentFrom.setUTCHours(0, 0, 0, 0);
        if (newEffectiveFrom >= mostRecentFrom) {
          const oneDayBefore = new Date(newEffectiveFrom);
          oneDayBefore.setUTCDate(oneDayBefore.getUTCDate() - 1);
          await this.payrollCompensationDao.update({
            id: mostRecent.id,
            data: { effectiveTill: oneDayBefore, isActive: false },
            tx,
          });
        }
      }

      await this.payrollCompensationDao.updateManyByUserId({
        userId: params.dto.employeeId,
        organizationId: params.currentUser.organizationId,
        data: { isActive: false },
        tx,
      });

      return this.payrollCompensationDao.create({
        data: {
          user: { connect: { id: params.dto.employeeId } },
          organization: { connect: { id: params.currentUser.organizationId } },
          grossAmount,
          effectiveFrom: newEffectiveFrom,
          effectiveTill: params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : undefined,
          isActive: true,
          payrollCompensationLineItems: {
            create: params.dto.lineItems.map((item) => ({
              title: item.title,
              amount: item.amount,
            })),
          },
        },
        tx,
      });
    });

    const created = await this.payrollCompensationDao.getById({ id: createdId, organizationId: params.currentUser.organizationId });
    if (!created) throw new ApiError('Failed to fetch created compensation', 500);

    return this.mapToResponse(created);
  }

  private async validate(params: Params): Promise<ValidateResult> {
    this.assertAdmin(params.currentUser);
    const employee = await this.employeeDao.getByUserId({ userId: params.dto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const newEffectiveFrom = parseDateOnly(params.dto.effectiveFrom);

    const existing = await this.payrollCompensationDao.findByUserIdOrderedByEffectiveFromDesc({
      userId: params.dto.employeeId,
      organizationId: params.currentUser.organizationId,
    });

    const mostRecent = existing[0];
    const compsToCheck = mostRecent ? existing.slice(1) : existing;

    validateEffectiveFromNoOverlap(newEffectiveFrom, compsToCheck);

    return {
      newEffectiveFrom,
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
