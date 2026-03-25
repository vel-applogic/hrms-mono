import { Injectable } from '@nestjs/common';
import { type LeaveResponseType, UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, LeaveConfigDao, LeaveDao, PrismaService, UserEmployeeDetailDao, UserEmployeeLeaveCounterDao } from '@repo/nest-lib';
import { ApiError, getFinancialYearCode, getFinancialYearDateRange } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class LeaveCancelUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeDetailDao: UserEmployeeDetailDao,
    private readonly leaveDao: LeaveDao,
    private readonly leaveConfigDao: LeaveConfigDao,
    private readonly userEmployeeLeaveCounterDao: UserEmployeeLeaveCounterDao,
  ) {}

  async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Cancelling leave request', { id: params.id, userId: params.currentUser.id });

    const isAdmin = params.currentUser.roles.includes(UserRoleDtoEnum.admin);
    const existing = await this.leaveDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Leave not found', 404);
    }
    if (existing.status === 'cancelled') {
      throw new ApiError('Leave request is already cancelled', 400);
    }
    if (!isAdmin) {
      if (existing.status !== 'pending') {
        throw new ApiError('Only pending leave requests can be cancelled by employees', 400);
      }
      const employee = await this.userEmployeeDetailDao.getByUserId({ userId: params.currentUser.id });
      if (!employee) {
        throw new ApiError('Only employees can cancel leave. UserEmployeeDetail not found.', 403);
      }
      if (existing.userId !== params.currentUser.id) {
        throw new ApiError('You can only cancel your own leave requests', 403);
      }
    }

    await this.leaveDao.update({
      id: params.id,
      data: { status: 'cancelled' },
    });

    if (existing.status === 'approved') {
      const financialYear = getFinancialYearCode(existing.startDate);
      const { start, end } = getFinancialYearDateRange(financialYear);
      const totals = await this.leaveDao.getApprovedLeaveTotalsByUserIdAndDateRange({
        userId: existing.userId,
        startDate: start,
        endDate: end,
      });
      const leaveConfig = await this.leaveConfigDao.getLatest();
      const maxLeaves = leaveConfig?.maxLeaves ?? 24;
      try {
        await this.userEmployeeLeaveCounterDao.syncFromActualLeaves({
          userId: existing.userId,
          financialYear,
          ...totals,
          maxLeaves,
        });
      } catch {
        this.logger.w('Failed to sync leave counter', { leaveId: params.id });
      }
    }

    const updated = await this.leaveDao.getById({ id: params.id });
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
      leaveType: updated.leaveType as import('@repo/dto').LeaveTypeDtoEnum,
      startDate: updated.startDate.toISOString().split('T')[0],
      endDate: updated.endDate.toISOString().split('T')[0],
      numberOfDays: updated.numberOfDays,
      reason: updated.reason,
      status: updated.status as import('@repo/dto').LeaveStatusDtoEnum,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
