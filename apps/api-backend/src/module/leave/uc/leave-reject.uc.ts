import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { type LeaveResponseType, NotificationLinkDtoEnum } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, EmployeeLeaveCounterDao, IUseCase, LeaveDao, LeaveWithUserType, NotificationService, OrganisationSettingDao, leaveDayHalfDbEnumToDtoEnum, leaveStatusDbEnumToDtoEnum, leaveTypeDbEnumToDtoEnum, PrismaService } from '@repo/nest-lib';
import { ApiError, DEFAULT_FINANCIAL_YEAR_START_MONTH, getFinancialYearCode, getFinancialYearDateRange } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class LeaveRejectUc extends BaseUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly leaveDao: LeaveDao,
    private readonly organisationSettingDao: OrganisationSettingDao,
    private readonly employeeLeaveCounterDao: EmployeeLeaveCounterDao,
    private readonly notificationService: NotificationService,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Rejecting leave request', { id: params.id, userId: params.currentUser.id });
    const existing = await this.validate(params);

    if (existing.status === 'approved') {
      const orgSettings = await this.organisationSettingDao.findByOrganisationId({ organisationId: params.currentUser.organisationId });
      const startMonth = orgSettings?.financialYearStartsAt ?? DEFAULT_FINANCIAL_YEAR_START_MONTH;
      const financialYear = getFinancialYearCode(existing.startDate, startMonth);
      const { start, end } = getFinancialYearDateRange(financialYear, startMonth);
      const maxLeaves = orgSettings?.totalLeaveInDays ?? 24;

      await this.prisma.$transaction(async (tx) => {
        await this.updateStatus(params, tx);
        await this.syncCounter(params, existing, financialYear, start, end, maxLeaves, tx);
      });
    } else {
      await this.prisma.$transaction(async (tx) => {
        await this.updateStatus(params, tx);
      });
    }

    void this.notificationService.send({
      organisationId: params.currentUser.organisationId,
      userId: existing.userId,
      title: 'Leave Rejected',
      message: `Your leave request from ${existing.startDate.toISOString().split('T')[0]} to ${existing.endDate.toISOString().split('T')[0]} has been rejected.`,
      link: NotificationLinkDtoEnum.empLeave,
    });

    return await this.getResponseById(params);
  }

  private async validate(params: Params): Promise<LeaveWithUserType> {
    this.assertAdmin(params.currentUser);

    const existing = await this.leaveDao.getById({ id: params.id, organisationId: params.currentUser.organisationId });
    if (!existing) {
      throw new ApiError('Leave not found', 404);
    }
    if (existing.status !== 'pending' && existing.status !== 'approved' && existing.status !== 'cancelled') {
      throw new ApiError('Leave request cannot be rejected', 400);
    }

    return existing;
  }

  private async updateStatus(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.leaveDao.update({
      id: params.id,
      organisationId: params.currentUser.organisationId,
      data: { status: 'rejected' },
      tx,
    });
  }

  private async syncCounter(
    params: Params,
    existing: LeaveWithUserType,
    financialYear: string,
    start: Date,
    end: Date,
    maxLeaves: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const totals = await this.leaveDao.getApprovedLeaveTotalsByUserIdAndDateRange({
      userId: existing.userId,
      organisationId: params.currentUser.organisationId,
      startDate: start,
      endDate: end,
      tx,
    });

    try {
      await this.employeeLeaveCounterDao.syncFromActualLeaves({
        userId: existing.userId,
        organisationId: params.currentUser.organisationId,
        financialYear,
        ...totals,
        maxLeaves,
        tx,
      });
    } catch {
      this.logger.w('Failed to sync leave counter', { leaveId: params.id });
    }
  }

  private async getResponseById(params: Params): Promise<LeaveResponseType> {
    const updated = await this.leaveDao.getById({ id: params.id, organisationId: params.currentUser.organisationId });
    if (!updated) throw new ApiError('Failed to fetch updated leave', 500);

    return {
      id: updated.id,
      userId: updated.userId,
      user: {
        id: updated.user.id,
        firstname: updated.user.firstname,
        lastname: updated.user.lastname,
        email: updated.user.email,
      },
      leaveType: leaveTypeDbEnumToDtoEnum(updated.leaveType),
      startDate: updated.startDate.toISOString().split('T')[0],
      endDate: updated.endDate.toISOString().split('T')[0],
      startDuration: leaveDayHalfDbEnumToDtoEnum(updated.startDuration),
      endDuration: leaveDayHalfDbEnumToDtoEnum(updated.endDuration),
      numberOfDays: updated.numberOfDays,
      reason: updated.reason,
      status: leaveStatusDbEnumToDtoEnum(updated.status),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
