import { Injectable } from '@nestjs/common';
import type { LeaveResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, EmployeeLeaveCounterDao, IUseCase, LeaveDao, OrganizationSettingDao, leaveStatusDbEnumToDtoEnum, leaveTypeDbEnumToDtoEnum, PrismaService } from '@repo/nest-lib';
import { ApiError, getFinancialYearCode, getFinancialYearDateRange } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class LeaveApproveUc extends BaseUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly leaveDao: LeaveDao,
    private readonly organizationSettingDao: OrganizationSettingDao,
    private readonly employeeLeaveCounterDao: EmployeeLeaveCounterDao,
  ) {
    super(prisma, logger);
  }

  async execute(params: Params): Promise<LeaveResponseType> {
    this.assertAdmin(params.currentUser);
    this.logger.i('Approving leave request', { id: params.id, userId: params.currentUser.id });

    const existing = await this.leaveDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Leave not found', 404);
    }
    if (existing.status !== 'pending' && existing.status !== 'rejected' && existing.status !== 'cancelled') {
      throw new ApiError('Leave request cannot be approved', 400);
    }

    const financialYear = getFinancialYearCode(existing.startDate);
    const { start, end } = getFinancialYearDateRange(financialYear);
    const orgSettings = await this.organizationSettingDao.findByOrganizationId({ organizationId: params.currentUser.organizationId });
    const maxLeaves = orgSettings?.totalLeaveInDays ?? 24;

    await this.prisma.$transaction(async (tx) => {
      await this.leaveDao.update({
        id: params.id,
        organizationId: params.currentUser.organizationId,
        data: { status: 'approved' },
        tx,
      });

      const totals = await this.leaveDao.getApprovedLeaveTotalsByUserIdAndDateRange({
        userId: existing.userId,
        organizationId: params.currentUser.organizationId,
        startDate: start,
        endDate: end,
        tx,
      });

      await this.employeeLeaveCounterDao.syncFromActualLeaves({
        userId: existing.userId,
        organizationId: params.currentUser.organizationId,
        financialYear,
        ...totals,
        maxLeaves,
        tx,
      });
    });

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
