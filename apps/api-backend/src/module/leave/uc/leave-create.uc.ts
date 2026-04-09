import { Injectable } from '@nestjs/common';
import { type LeaveDayHalfEnum, LeaveStatusEnum, type LeaveTypeEnum, type Prisma } from '@repo/db';
import { LeaveDayHalfDtoEnum, type LeaveCreateRequestType, type LeaveResponseType, UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeDao, HolidayDao, IUseCase, LeaveDao, OrganizationSettingDao, leaveDayHalfDbEnumToDtoEnum, leaveDayHalfDtoEnumToDbEnum, leaveStatusDbEnumToDtoEnum, leaveTypeDbEnumToDtoEnum, leaveTypeDtoEnumToDbEnum, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  dto: LeaveCreateRequestType;
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
export class LeaveCreateUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly leaveDao: LeaveDao,
    private readonly organizationSettingDao: OrganizationSettingDao,
    private readonly holidayDao: HolidayDao,
  ) {}

  public async execute(params: Params): Promise<LeaveResponseType> {
    const targetUserId = params.dto.userId;
    this.logger.i('Creating leave request', { userId: targetUserId, requestedBy: params.currentUser.id });
    const validateResult = await this.validate(params);

    const createdId = await this.prisma.$transaction(async (tx) => {
      return await this.create(params, validateResult, tx);
    });

    return await this.getResponseById(params, createdId);
  }

  private async validate(params: Params): Promise<{ startDate: Date; endDate: Date; numberOfDays: number; leaveTypeDb: LeaveTypeEnum; startDurationDb: LeaveDayHalfEnum; endDurationDb: LeaveDayHalfEnum }> {
    const targetUserId = params.dto.userId;

    if (!params.currentUser.roles.includes(UserRoleDtoEnum.admin) && targetUserId !== params.currentUser.id) {
      throw new ApiError('You can only apply for leave on your own behalf', 403);
    }

    const employee = await this.employeeDao.getByUserId({ userId: targetUserId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Selected user is not an employee', 403);
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
      userId: targetUserId,
      organizationId: params.currentUser.organizationId,
      statuses: countStatuses,
      leaveType: leaveTypeDb,
    });
    const existingTotal = await this.leaveDao.sumDaysByUserIdAndStatus({
      userId: targetUserId,
      organizationId: params.currentUser.organizationId,
      statuses: countStatuses,
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

  private async create(
    params: Params,
    validateResult: { startDate: Date; endDate: Date; numberOfDays: number; leaveTypeDb: LeaveTypeEnum; startDurationDb: LeaveDayHalfEnum; endDurationDb: LeaveDayHalfEnum },
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const targetUserId = params.dto.userId;
    const { startDate, endDate, numberOfDays, leaveTypeDb, startDurationDb, endDurationDb } = validateResult;

    return this.leaveDao.create({
      data: {
        user: { connect: { id: targetUserId } },
        organization: { connect: { id: params.currentUser.organizationId } },
        leaveType: leaveTypeDb,
        startDate,
        endDate,
        startDuration: startDurationDb,
        endDuration: endDurationDb,
        numberOfDays,
        reason: params.dto.reason,
        status: 'pending',
      },
      tx,
    });
  }

  private async getResponseById(params: Params, id: number): Promise<LeaveResponseType> {
    const withUser = await this.leaveDao.getById({ id, organizationId: params.currentUser.organizationId });
    if (!withUser) throw new ApiError('Failed to fetch created leave', 500);

    return {
      id: withUser.id,
      userId: withUser.userId,
      user: {
        id: withUser.user.id,
        firstname: withUser.user.firstname,
        lastname: withUser.user.lastname,
        email: withUser.user.email,
      },
      leaveType: leaveTypeDbEnumToDtoEnum(withUser.leaveType),
      startDate: withUser.startDate.toISOString().split('T')[0],
      endDate: withUser.endDate.toISOString().split('T')[0],
      startDuration: leaveDayHalfDbEnumToDtoEnum(withUser.startDuration),
      endDuration: leaveDayHalfDbEnumToDtoEnum(withUser.endDuration),
      numberOfDays: withUser.numberOfDays,
      reason: withUser.reason,
      status: leaveStatusDbEnumToDtoEnum(withUser.status),
      createdAt: withUser.createdAt.toISOString(),
      updatedAt: withUser.updatedAt.toISOString(),
    };
  }
}
