import { Injectable } from '@nestjs/common';
import { type LeaveDayHalfEnum, LeaveStatusEnum, type LeaveTypeEnum, type Prisma } from '@repo/db';
import { LeaveDayHalfDtoEnum, type LeaveResponseType, type LeaveUpdateRequestType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeDao, HolidayDao, IUseCase, LeaveDao, OrganizationSettingDao, leaveDayHalfDbEnumToDtoEnum, leaveDayHalfDtoEnumToDbEnum, leaveStatusDbEnumToDtoEnum, leaveTypeDbEnumToDtoEnum, leaveTypeDtoEnumToDbEnum, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: LeaveUpdateRequestType;
};

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getWorkingDays(start: Date, end: Date, weeklyOffDays: number[], holidayDates: Date[]): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  const offSet = new Set(weeklyOffDays);
  const holidaySet = new Set(holidayDates.map((d) => toDateKey(new Date(d))));

  while (current <= endDate) {
    if (!offSet.has(current.getDay()) && !holidaySet.has(toDateKey(current))) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function isExcludedDay(d: Date, weeklyOffDays: number[], holidayDates: Date[]): boolean {
  const offSet = new Set(weeklyOffDays);
  const holidaySet = new Set(holidayDates.map((dh) => toDateKey(new Date(dh))));
  return offSet.has(d.getDay()) || holidaySet.has(toDateKey(d));
}

function calculateLeaveDays(params: {
  startDate: Date;
  endDate: Date;
  startDuration: LeaveDayHalfDtoEnum;
  endDuration: LeaveDayHalfDtoEnum;
  isSameDay: boolean;
  weeklyOffDays: number[];
  holidayDates: Date[];
}): number {
  const { startDate, endDate, startDuration, endDuration, isSameDay, weeklyOffDays, holidayDates } = params;
  if (isSameDay) {
    if (isExcludedDay(startDate, weeklyOffDays, holidayDates)) return 0;
    if (startDuration === LeaveDayHalfDtoEnum.full) return 1;
    return 0.5;
  }
  let days = getWorkingDays(startDate, endDate, weeklyOffDays, holidayDates);
  if (startDuration === LeaveDayHalfDtoEnum.secondHalf && !isExcludedDay(startDate, weeklyOffDays, holidayDates)) days -= 0.5;
  if (endDuration === LeaveDayHalfDtoEnum.firstHalf && !isExcludedDay(endDate, weeklyOffDays, holidayDates)) days -= 0.5;
  return days;
}

function validateHalfDaySelection(params: { isSameDay: boolean; startDuration: LeaveDayHalfDtoEnum; endDuration: LeaveDayHalfDtoEnum }): void {
  const { isSameDay, startDuration, endDuration } = params;
  if (isSameDay) {
    if (startDuration !== LeaveDayHalfDtoEnum.full && startDuration !== endDuration) {
      throw new ApiError('Half day selection must match for same-day leave', 400);
    }
    return;
  }
  if (startDuration === LeaveDayHalfDtoEnum.firstHalf) {
    throw new ApiError('Start day first half is only allowed for single-day leave', 400);
  }
  if (endDuration === LeaveDayHalfDtoEnum.secondHalf) {
    throw new ApiError('End day second half is not allowed when dates differ', 400);
  }
}

function getTypeLimit(config: { totalLeaveInDays: number; sickLeaveInDays: number; earnedLeaveInDays: number; casualLeaveInDays: number }, leaveType: string): number {
  switch (leaveType) {
    case 'casual':
      return config.casualLeaveInDays;
    case 'sick':
    case 'medical':
      return config.sickLeaveInDays;
    case 'earned':
      return config.earnedLeaveInDays;
    default:
      return 0;
  }
}

@Injectable()
export class LeaveUpdateUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly leaveDao: LeaveDao,
    private readonly organizationSettingDao: OrganizationSettingDao,
    private readonly holidayDao: HolidayDao,
  ) {}

  public async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Updating leave request', { id: params.id, userId: params.currentUser.id });
    const validateResult = await this.validate(params);

    await this.prisma.$transaction(async (tx) => {
      await this.update(params, validateResult, tx);
    });

    return await this.getResponseById(params);
  }

  private async validate(params: Params): Promise<{ startDate: Date; endDate: Date; numberOfDays: number; leaveTypeDb: LeaveTypeEnum; startDurationDb: LeaveDayHalfEnum; endDurationDb: LeaveDayHalfEnum }> {
    const employee = await this.employeeDao.getByUserId({ userId: params.currentUser.id, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Only employees can edit leave. Employee not found.', 403);
    }

    const existing = await this.leaveDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Leave not found', 404);
    }
    if (existing.userId !== params.currentUser.id) {
      throw new ApiError('You can only edit your own leave requests', 403);
    }
    if (existing.status !== 'pending') {
      throw new ApiError('Only pending leave requests can be edited', 400);
    }

    const config = await this.organizationSettingDao.findByOrganizationId({ organizationId: params.currentUser.organizationId });
    if (!config) {
      throw new ApiError('Organization settings not found', 500);
    }

    const startDate = new Date(params.dto.startDate);
    const endDate = new Date(params.dto.endDate);
    if (endDate < startDate) {
      throw new ApiError('End date must be on or after start date', 400);
    }

    const isSameDay = params.dto.startDate === params.dto.endDate;
    const startDuration = params.dto.startDuration ?? LeaveDayHalfDtoEnum.full;
    const endDuration = params.dto.endDuration ?? LeaveDayHalfDtoEnum.full;
    validateHalfDaySelection({ isSameDay, startDuration, endDuration });

    const weeklyOffDays = config.weeklyOffDays ?? [0, 6];
    const holidays = await this.holidayDao.findByDateRange({
      organizationId: params.currentUser.organizationId,
      startDate,
      endDate,
    });
    const holidayDates = holidays.map((h) => h.date);

    const numberOfDays = calculateLeaveDays({ startDate, endDate, startDuration, endDuration, isSameDay, weeklyOffDays, holidayDates });
    if (numberOfDays < 0.5) {
      throw new ApiError('Selected range has no working days (excluding week-offs and holidays)', 400);
    }
    const startDurationDb = leaveDayHalfDtoEnumToDbEnum(startDuration);
    const endDurationDb = leaveDayHalfDtoEnumToDbEnum(endDuration);

    const countStatuses: LeaveStatusEnum[] = [LeaveStatusEnum.pending, LeaveStatusEnum.approved];
    const leaveTypeDb = leaveTypeDtoEnumToDbEnum(params.dto.leaveType);
    const existingByType = await this.leaveDao.sumDaysByUserIdAndStatus({
      userId: params.currentUser.id,
      organizationId: params.currentUser.organizationId,
      statuses: countStatuses,
      leaveType: leaveTypeDb,
      excludeLeaveId: params.id,
    });
    const existingTotal = await this.leaveDao.sumDaysByUserIdAndStatus({
      userId: params.currentUser.id,
      organizationId: params.currentUser.organizationId,
      statuses: countStatuses,
      excludeLeaveId: params.id,
    });

    const typeLimit = getTypeLimit(config, params.dto.leaveType);
    if (existingByType + numberOfDays > typeLimit) {
      throw new ApiError(`Exceeds ${params.dto.leaveType} leave limit. Used: ${existingByType}, Limit: ${typeLimit}, Requested: ${numberOfDays}`, 400);
    }
    if (existingTotal + numberOfDays > config.totalLeaveInDays) {
      throw new ApiError(`Exceeds total leave limit. Used: ${existingTotal}, Limit: ${config.totalLeaveInDays}, Requested: ${numberOfDays}`, 400);
    }

    return { startDate, endDate, numberOfDays, leaveTypeDb, startDurationDb, endDurationDb };
  }

  private async update(
    params: Params,
    validateResult: { startDate: Date; endDate: Date; numberOfDays: number; leaveTypeDb: LeaveTypeEnum; startDurationDb: LeaveDayHalfEnum; endDurationDb: LeaveDayHalfEnum },
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const { startDate, endDate, numberOfDays, leaveTypeDb, startDurationDb, endDurationDb } = validateResult;

    await this.leaveDao.update({
      id: params.id,
      organizationId: params.currentUser.organizationId,
      data: {
        leaveType: leaveTypeDb,
        startDate,
        endDate,
        startDuration: startDurationDb,
        endDuration: endDurationDb,
        numberOfDays,
        reason: params.dto.reason,
      },
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
