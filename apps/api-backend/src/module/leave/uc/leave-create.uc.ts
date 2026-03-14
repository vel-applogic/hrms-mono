import { Injectable } from '@nestjs/common';
import type { LeaveCreateRequestType, LeaveResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, LeaveConfigDao, LeaveDao, PrismaService, UserEmployeeDetailDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  dto: LeaveCreateRequestType;
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
export class LeaveCreateUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeDetailDao: UserEmployeeDetailDao,
    private readonly leaveDao: LeaveDao,
    private readonly leaveConfigDao: LeaveConfigDao,
  ) {}

  async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Creating leave request', { userId: params.currentUser.id });

    const employee = await this.userEmployeeDetailDao.getByUserId({ userId: params.currentUser.id });
    if (!employee) {
      // throw new ApiError('Only employees can apply for leave.', 403); // FIXME: enable this when test over
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

    const numberOfDays = getBusinessDays(startDate, endDate);
    if (numberOfDays < 1) {
      throw new ApiError('At least one business day is required', 400);
    }

    const countStatuses = ['pending', 'approved'];
    const existingByType = await this.leaveDao.sumDaysByUserIdAndStatus({
      userId: params.currentUser.id,
      statuses: countStatuses,
      leaveType: params.dto.leaveType,
    });
    const existingTotal = await this.leaveDao.sumDaysByUserIdAndStatus({
      userId: params.currentUser.id,
      statuses: countStatuses,
    });

    const typeLimit = getTypeLimit(config, params.dto.leaveType);
    if (existingByType + numberOfDays > typeLimit) {
      throw new ApiError(`Exceeds ${params.dto.leaveType} leave limit. Used: ${existingByType}, Limit: ${typeLimit}, Requested: ${numberOfDays}`, 400);
    }
    if (existingTotal + numberOfDays > config.maxLeaves) {
      throw new ApiError(`Exceeds total leave limit. Used: ${existingTotal}, Limit: ${config.maxLeaves}, Requested: ${numberOfDays}`, 400);
    }

    const created = await this.leaveDao.create({
      data: {
        user: { connect: { id: params.currentUser.id } },
        leaveType: params.dto.leaveType as 'casual' | 'sick' | 'medical' | 'earned',
        startDate,
        endDate,
        numberOfDays,
        reason: params.dto.reason,
        status: 'pending',
      },
    });

    const withUser = await this.leaveDao.getById({ id: created.id });
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
      leaveType: withUser.leaveType as import('@repo/dto').LeaveTypeDtoEnum,
      startDate: withUser.startDate.toISOString().split('T')[0],
      endDate: withUser.endDate.toISOString().split('T')[0],
      numberOfDays: withUser.numberOfDays,
      reason: withUser.reason,
      status: withUser.status as import('@repo/dto').LeaveStatusDtoEnum,
      createdAt: withUser.createdAt.toISOString(),
      updatedAt: withUser.updatedAt.toISOString(),
    };
  }
}
