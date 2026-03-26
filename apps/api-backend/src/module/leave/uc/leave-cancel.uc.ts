import { Injectable } from '@nestjs/common';
import { type LeaveResponseType, UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeDao, EmployeeLeaveCounterDao, IUseCase, LeaveConfigDao, LeaveDao, leaveStatusDbEnumToDtoEnum, leaveTypeDbEnumToDtoEnum, PrismaService } from '@repo/nest-lib';
import { ApiError, getFinancialYearCode, getFinancialYearDateRange } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class LeaveCancelUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly leaveDao: LeaveDao,
    private readonly leaveConfigDao: LeaveConfigDao,
    private readonly employeeLeaveCounterDao: EmployeeLeaveCounterDao,
  ) {}

  async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Cancelling leave request', { id: params.id, userId: params.currentUser.id });

    const isAdmin = params.currentUser.roles.includes(UserRoleDtoEnum.admin);
    const existing = await this.leaveDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
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
      const employee = await this.employeeDao.getByUserId({ userId: params.currentUser.id, organizationId: params.currentUser.organizationId });
      if (!employee) {
        throw new ApiError('Only employees can cancel leave. Employee not found.', 403);
      }
      if (existing.userId !== params.currentUser.id) {
        throw new ApiError('You can only cancel your own leave requests', 403);
      }
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
          data: { status: 'cancelled' },
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
          data: { status: 'cancelled' },
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
