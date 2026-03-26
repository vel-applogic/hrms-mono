import { Injectable } from '@nestjs/common';
import type { LeaveResponseType } from '@repo/dto';
import { UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeLeaveCounterDao, IUseCase, LeaveConfigDao, LeaveDao, leaveStatusDbEnumToDtoEnum, leaveTypeDbEnumToDtoEnum, PrismaService } from '@repo/nest-lib';
import { ApiError, getFinancialYearCode, getFinancialYearDateRange } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class LeaveRejectUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly leaveDao: LeaveDao,
    private readonly leaveConfigDao: LeaveConfigDao,
    private readonly employeeLeaveCounterDao: EmployeeLeaveCounterDao,
  ) {}

  async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Rejecting leave request', { id: params.id, userId: params.currentUser.id });

    if (!params.currentUser.roles.includes(UserRoleDtoEnum.admin)) {
      throw new ApiError('Only admins can reject leave requests', 403);
    }

    const existing = await this.leaveDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Leave not found', 404);
    }
    if (existing.status !== 'pending' && existing.status !== 'approved' && existing.status !== 'cancelled') {
      throw new ApiError('Leave request cannot be rejected', 400);
    }

    if (existing.status === 'approved') {
      const financialYear = getFinancialYearCode(existing.startDate);
      const { start, end } = getFinancialYearDateRange(financialYear);
      const leaveConfig = await this.leaveConfigDao.getLatest();
      const maxLeaves = leaveConfig?.maxLeaves ?? 24;

      await this.prisma.$transaction(async (tx) => {
        await this.leaveDao.update({
          id: params.id,
          organizationId: params.currentUser.organizationId,
          data: { status: 'rejected' },
          tx,
        });

        const totals = await this.leaveDao.getApprovedLeaveTotalsByUserIdAndDateRange({
          userId: existing.userId,
          organizationId: params.currentUser.organizationId,
          startDate: start,
          endDate: end,
          tx,
        });

        try {
          await this.employeeLeaveCounterDao.syncFromActualLeaves({
            userId: existing.userId,
            organizationId: params.currentUser.organizationId,
            financialYear,
            ...totals,
            maxLeaves,
            tx,
          });
        } catch {
          this.logger.w('Failed to sync leave counter', { leaveId: params.id });
        }
      });
    } else {
      await this.prisma.$transaction(async (tx) => {
        await this.leaveDao.update({
          id: params.id,
          organizationId: params.currentUser.organizationId,
          data: { status: 'rejected' },
          tx,
        });
      });
    }

    const updated = await this.leaveDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
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
      numberOfDays: updated.numberOfDays,
      reason: updated.reason,
      status: leaveStatusDbEnumToDtoEnum(updated.status),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
