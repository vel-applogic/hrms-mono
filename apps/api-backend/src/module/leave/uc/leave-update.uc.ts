import { Injectable } from '@nestjs/common';
import type {
  LeaveResponseType,
  LeaveUpdateRequestType,
} from '@repo/dto';
import {
  LeaveConfigDao,
  LeaveDao,
  EmployeeDao,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  PrismaService,
} from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: LeaveUpdateRequestType;
};

function getBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function getTypeLimit(config: { maxLeaves: number; maxSickLeaves: number; maxEarnedLeaves: number; maxCasualLeaves: number }, leaveType: string): number {
  switch (leaveType) {
    case 'casual':
      return config.maxCasualLeaves;
    case 'sick':
    case 'medical':
      return config.maxSickLeaves;
    case 'earned':
      return config.maxEarnedLeaves;
    default:
      return 0;
  }
}

@Injectable()
export class LeaveUpdateUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly leaveDao: LeaveDao,
    private readonly leaveConfigDao: LeaveConfigDao,
  ) {}

  async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Updating leave request', { id: params.id, userId: params.currentUser.id });

    const employee = await this.employeeDao.getByUserId({ userId: params.currentUser.id });
    if (!employee) {
      throw new ApiError('Only employees can edit leave. Employee not found.', 403);
    }

    const existing = await this.leaveDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Leave not found', 404);
    }
    if (existing.userId !== params.currentUser.id) {
      throw new ApiError('You can only edit your own leave requests', 403);
    }
    if (existing.status !== 'pending') {
      throw new ApiError('Only pending leave requests can be edited', 400);
    }

    const config = await this.leaveConfigDao.getLatest();
    if (!config) {
      throw new ApiError('Leave configuration not found', 500);
    }

    const startDate = new Date(params.dto.startDate);
    const endDate = new Date(params.dto.endDate);
    if (endDate < startDate) {
      throw new ApiError('End date must be on or after start date', 400);
    }

    const isSameDay = params.dto.startDate === params.dto.endDate;
    const numberOfDays = isSameDay ? 1 : getBusinessDays(startDate, endDate);
    if (numberOfDays < 1) {
      throw new ApiError('At least one business day is required', 400);
    }

    const countStatuses = ['pending', 'approved'];
    const existingByType = await this.leaveDao.sumDaysByUserIdAndStatus({
      userId: params.currentUser.id,
      statuses: countStatuses,
      leaveType: params.dto.leaveType,
      excludeLeaveId: params.id,
    });
    const existingTotal = await this.leaveDao.sumDaysByUserIdAndStatus({
      userId: params.currentUser.id,
      statuses: countStatuses,
      excludeLeaveId: params.id,
    });

    const typeLimit = getTypeLimit(config, params.dto.leaveType);
    if (existingByType + numberOfDays > typeLimit) {
      throw new ApiError(
        `Exceeds ${params.dto.leaveType} leave limit. Used: ${existingByType}, Limit: ${typeLimit}, Requested: ${numberOfDays}`,
        400,
      );
    }
    if (existingTotal + numberOfDays > config.maxLeaves) {
      throw new ApiError(
        `Exceeds total leave limit. Used: ${existingTotal}, Limit: ${config.maxLeaves}, Requested: ${numberOfDays}`,
        400,
      );
    }

    await this.leaveDao.update({
      id: params.id,
      data: {
        leaveType: params.dto.leaveType as 'casual' | 'sick' | 'medical' | 'earned',
        startDate,
        endDate,
        numberOfDays,
        reason: params.dto.reason,
      },
    });

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
