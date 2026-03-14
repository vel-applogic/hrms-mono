import { Injectable } from '@nestjs/common';
import type { LeaveResponseType } from '@repo/dto';
import { LeaveDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class LeaveRejectUc implements IUseCase<Params, LeaveResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly leaveDao: LeaveDao,
  ) {}

  async execute(params: Params): Promise<LeaveResponseType> {
    this.logger.i('Rejecting leave request', { id: params.id, userId: params.currentUser.id });

    if (params.currentUser.role !== 'admin') {
      throw new ApiError('Only admins can reject leave requests', 403);
    }

    const existing = await this.leaveDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Leave not found', 404);
    }
    if (existing.status !== 'pending' && existing.status !== 'approved' && existing.status !== 'cancelled') {
      throw new ApiError('Leave request cannot be rejected', 400);
    }

    await this.leaveDao.update({
      id: params.id,
      data: { status: 'rejected' },
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
