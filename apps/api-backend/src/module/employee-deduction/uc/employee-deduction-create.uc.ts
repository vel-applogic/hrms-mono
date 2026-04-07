import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { EmployeeDeductionCreateRequestType, EmployeeDeductionResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, PayrollDeductionDao, EmployeeDao } from '@repo/nest-lib';
import type { PayrollDeductionWithLineItemsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { parseDateOnly, parseMonthYearToFirstDay, validateEffectiveFromBeforeTill } from './_employee-deduction-validation.helper.js';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeDeductionCreateRequestType;
};

@Injectable()
export class EmployeeDeductionCreateUc extends BaseUc implements IUseCase<Params, EmployeeDeductionResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly payrollDeductionDao: PayrollDeductionDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<EmployeeDeductionResponseType> {
    this.assertAdmin(params.currentUser);
    this.logger.i('Creating employee deduction', { employeeId: params.dto.employeeId });
    const { effectiveFrom, effectiveTill } = await this.validate(params);

    const createdId = await this.prisma.$transaction(async (tx) => {
      await this.closePreviousDeduction(params, effectiveFrom, tx);
      await this.deactivateAllForUser(params, tx);
      return await this.create(params, effectiveFrom, effectiveTill, tx);
    });

    return await this.getResponseById(createdId, params);
  }

  private async validate(params: Params): Promise<{ effectiveFrom: Date; effectiveTill: Date | null }> {
    const employee = await this.employeeDao.getByUserId({ userId: params.dto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const effectiveFrom = parseDateOnly(params.dto.effectiveFrom);
    const effectiveTill = params.dto.effectiveTill ? parseDateOnly(params.dto.effectiveTill) : null;
    validateEffectiveFromBeforeTill(effectiveFrom, effectiveTill);

    return { effectiveFrom, effectiveTill };
  }

  private async closePreviousDeduction(params: Params, effectiveFrom: Date, tx: Prisma.TransactionClient): Promise<void> {
    const existingDeductions = await this.payrollDeductionDao.findByUserIdOrderedByEffectiveFromDesc({
      userId: params.dto.employeeId,
      organizationId: params.currentUser.organizationId,
      tx,
    });

    if (existingDeductions.length > 0) {
      const mostRecent = existingDeductions[0]!;
      if (effectiveFrom >= mostRecent.effectiveFrom) {
        const oneDayBefore = new Date(effectiveFrom);
        oneDayBefore.setUTCDate(oneDayBefore.getUTCDate() - 1);
        await this.payrollDeductionDao.update({
          id: mostRecent.id,
          data: { effectiveTill: oneDayBefore, isActive: false },
          tx,
        });
      }
    }
  }

  private async deactivateAllForUser(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.payrollDeductionDao.updateManyByUserId({
      userId: params.dto.employeeId,
      organizationId: params.currentUser.organizationId,
      data: { isActive: false },
      tx,
    });
  }

  private async create(params: Params, effectiveFrom: Date, effectiveTill: Date | null, tx: Prisma.TransactionClient): Promise<number> {
    return this.payrollDeductionDao.create({
      data: {
        user: { connect: { id: params.dto.employeeId } },
        organization: { connect: { id: params.currentUser.organizationId } },
        effectiveFrom,
        effectiveTill: effectiveTill ?? undefined,
        isActive: params.dto.isActive ?? true,
        payrollDeductionLineItems: {
          create: params.dto.lineItems.map((item) => ({
            type: item.type,
            frequency: item.frequency,
            amount: item.amount,
            otherTitle: item.type === 'other' ? (item.otherTitle ?? null) : null,
            specificMonth: item.frequency === 'specificMonth' && item.specificMonth ? parseMonthYearToFirstDay(item.specificMonth) : null,
          })),
        },
      },
      tx,
    });
  }

  private async getResponseById(id: number, params: Params): Promise<EmployeeDeductionResponseType> {
    const created = await this.payrollDeductionDao.getById({ id, organizationId: params.currentUser.organizationId });
    if (!created) throw new ApiError('Failed to fetch created deduction', 500);
    return this.mapToResponse(created);
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
