import { Injectable } from '@nestjs/common';
import { LeaveStatusEnum } from '@repo/db';
import { type LeaveCreateRequestType, type LeaveResponseType, UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeDao, IUseCase, LeaveConfigDao, LeaveDao, leaveStatusDbEnumToDtoEnum, leaveTypeDbEnumToDtoEnum, leaveTypeDtoEnumToDbEnum, PrismaService } from '@repo/nest-lib';
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
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly leaveDao: LeaveDao,
    private readonly leaveConfigDao: LeaveConfigDao,
  ) {}

  async execute(params: Params): Promise<LeaveResponseType> {
    const targetUserId = params.dto.userId;
    this.logger.i('Creating leave request', { userId: targetUserId, requestedBy: params.currentUser.id });

    if (!params.currentUser.roles.includes(UserRoleDtoEnum.admin) && targetUserId !== params.currentUser.id) {
      throw new ApiError('You can only apply for leave on your own behalf', 403);
    }

    const employee = await this.employeeDao.getByUserId({ userId: targetUserId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Selected user is not an employee', 403);
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
    if (existingTotal + numberOfDays > config.maxLeaves) {
      throw new ApiError(`Exceeds total leave limit. Used: ${existingTotal}, Limit: ${config.maxLeaves}, Requested: ${numberOfDays}`, 400);
    }

    const createdId = await this.prisma.$transaction(async (tx) => {
      return this.leaveDao.create({
        data: {
          user: { connect: { id: targetUserId } },
          organization: { connect: { id: params.currentUser.organizationId } },
          leaveType: leaveTypeDb,
          startDate,
          endDate,
          numberOfDays,
          reason: params.dto.reason,
          status: 'pending',
        },
        tx,
      });
    });

    const withUser = await this.leaveDao.getById({ id: createdId, organizationId: params.currentUser.organizationId });
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
      numberOfDays: withUser.numberOfDays,
      reason: withUser.reason,
      status: leaveStatusDbEnumToDtoEnum(withUser.status),
      createdAt: withUser.createdAt.toISOString(),
      updatedAt: withUser.updatedAt.toISOString(),
    };
  }
}
