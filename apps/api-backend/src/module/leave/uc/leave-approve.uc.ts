import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { LeaveResponseType } from '@repo/dto';
import { LeaveDayHalfEnum } from '@repo/db';
import { BaseUc, CommonLoggerService, CurrentUserType, EmployeeLeaveCounterDao, HolidayDao, IUseCase, LeaveDao, LeaveWithUserType, OrganizationSettingDao, leaveDayHalfDbEnumToDtoEnum, leaveStatusDbEnumToDtoEnum, leaveTypeDbEnumToDtoEnum, PrismaService } from '@repo/nest-lib';

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeWorkingDays(params: {
  startDate: Date;
  endDate: Date;
  startDuration: LeaveDayHalfEnum;
  endDuration: LeaveDayHalfEnum;
  weeklyOffDays: number[];
  holidayDates: Date[];
}): number {
  const { startDate, endDate, startDuration, endDuration, weeklyOffDays, holidayDates } = params;
  const offSet = new Set(weeklyOffDays);
  const holidaySet = new Set(holidayDates.map((d) => toDateKey(new Date(d))));

  const isExcluded = (d: Date): boolean => offSet.has(d.getDay()) || holidaySet.has(toDateKey(d));

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const isSameDay = start.getTime() === end.getTime();

  if (isSameDay) {
    if (isExcluded(start)) return 0;
    if (startDuration === LeaveDayHalfEnum.full) return 1;
    return 0.5;
  }

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    if (!isExcluded(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  if (startDuration === LeaveDayHalfEnum.secondHalf && !isExcluded(start)) count -= 0.5;
  if (endDuration === LeaveDayHalfEnum.firstHalf && !isExcluded(end)) count -= 0.5;
  return count;
}
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
    private readonly holidayDao: HolidayDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Approving leave request', { id: params.id, userId: params.currentUser.id });
    const existing = await this.validate(params);

    const financialYear = getFinancialYearCode(existing.startDate);
    const { start, end } = getFinancialYearDateRange(financialYear);
    const orgSettings = await this.organizationSettingDao.findByOrganizationId({ organizationId: params.currentUser.organizationId });
    const maxLeaves = orgSettings?.totalLeaveInDays ?? 24;
    const weeklyOffDays = orgSettings?.weeklyOffDays ?? [0, 6];

    const holidays = await this.holidayDao.findByDateRange({
      organizationId: params.currentUser.organizationId,
      startDate: existing.startDate,
      endDate: existing.endDate,
    });
    const holidayDates = holidays.map((h) => h.date);

    const recomputedDays = computeWorkingDays({
      startDate: existing.startDate,
      endDate: existing.endDate,
      startDuration: existing.startDuration,
      endDuration: existing.endDuration,
      weeklyOffDays,
      holidayDates,
    });

    if (recomputedDays < 0.5) {
      throw new ApiError('Leave range has no working days after applying week-offs and holidays', 400);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.updateStatusAndDays(params, recomputedDays, tx);
      await this.syncCounter(params, existing, financialYear, start, end, maxLeaves, tx);
    });

    return await this.getResponseById(params);
  }

  private async validate(params: Params): Promise<LeaveWithUserType> {
    this.assertAdmin(params.currentUser);

    const existing = await this.leaveDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Leave not found', 404);
    }
    if (existing.status !== 'pending' && existing.status !== 'rejected' && existing.status !== 'cancelled') {
      throw new ApiError('Leave request cannot be approved', 400);
    }

    return existing;
  }

  private async updateStatusAndDays(params: Params, numberOfDays: number, tx: Prisma.TransactionClient): Promise<void> {
    await this.leaveDao.update({
      id: params.id,
      organizationId: params.currentUser.organizationId,
      data: { status: 'approved', numberOfDays },
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
  }

  private async getResponseById(params: Params): Promise<LeaveResponseType> {
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
