import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { EmployeeCompensationCreateRequestType, EmployeeCompensationResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, PayrollCompensationDao, EmployeeDao } from '@repo/nest-lib';
import type { PayrollCompensationWithLineItemsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { parseDateOnly, validateEffectiveFromNoOverlap } from './_employee-compensation-validation.helper.js';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeCompensationCreateRequestType;
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

  public async execute(params: Params): Promise<EmployeeCompensationResponseType> {
    this.logger.i('Creating employee compensation', { employeeId: params.dto.employeeId });
    const validateData = await this.validate(params);

    const createdId = await this.prisma.$transaction(async (tx) => {
      if (validateData.mostRecent) {
        await this.closePreviousCompensation(validateData.newEffectiveFrom, validateData.mostRecent, tx);
      }
      await this.deactivateAllForUser(params, tx);
      return await this.create(params, validateData.newEffectiveFrom, tx);
    });

    return await this.getResponseById(createdId, params);
  }

  private async validate(params: Params): Promise<{
    newEffectiveFrom: Date;
    mostRecent: { id: number; effectiveFrom: Date; effectiveTill: Date | null } | undefined;
  }> {
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

  private async closePreviousCompensation(
    newEffectiveFrom: Date,
    mostRecent: { id: number; effectiveFrom: Date; effectiveTill: Date | null },
    tx: Prisma.TransactionClient,
  ): Promise<void> {
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

  private async deactivateAllForUser(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.payrollCompensationDao.updateManyByUserId({
      userId: params.dto.employeeId,
      organizationId: params.currentUser.organizationId,
      data: { isActive: false },
      tx,
    });
  }

  private async create(params: Params, newEffectiveFrom: Date, tx: Prisma.TransactionClient): Promise<number> {
    const grossAmount = params.dto.lineItems.reduce((sum, item) => sum + item.amount, 0);
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
  }

  private async getResponseById(id: number, params: Params): Promise<EmployeeCompensationResponseType> {
    const created = await this.payrollCompensationDao.getById({ id, organizationId: params.currentUser.organizationId });
    if (!created) throw new ApiError('Failed to fetch created compensation', 500);
    return this.mapToResponse(created);
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
