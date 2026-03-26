import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { LeaveFilterRequestType, LeaveResponseType, PaginatedResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, LeaveDao, PrismaService } from '@repo/nest-lib';
import { getFinancialYearDateRange } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  filterDto: LeaveFilterRequestType;
};

@Injectable()
export class LeaveListUc implements IUseCase<Params, PaginatedResponseType<LeaveResponseType>> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly leaveDao: LeaveDao,
  ) {}

  async execute(params: Params): Promise<PaginatedResponseType<LeaveResponseType>> {
    this.logger.i('Listing leaves', { userId: params.currentUser.id });

    const where: Prisma.LeaveWhereInput = {};
    if (params.filterDto.status?.length) {
      where.status = { in: params.filterDto.status as ('pending' | 'approved' | 'rejected' | 'cancelled')[] };
    }
    if (params.filterDto.userId?.length) {
      where.userId = { in: params.filterDto.userId };
    }
    if (params.filterDto.financialYear) {
      const { start, end } = getFinancialYearDateRange(params.filterDto.financialYear);
      where.startDate = { gte: start, lte: end };
    }
    if (params.filterDto.search?.trim()) {
      const q = params.filterDto.search.trim();
      where.user = {
        ...(where.user as object),
        OR: [{ firstname: { contains: q, mode: 'insensitive' } }, { lastname: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }],
      };
    }

    const { leaves, totalRecords } = await this.leaveDao.findManyWithPagination({
      organizationId: params.currentUser.organizationId,
      where,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
    });

    const results = leaves.map((l) => ({
      id: l.id,
      userId: l.userId,
      user: {
        id: l.user.id,
        firstname: l.user.firstname,
        lastname: l.user.lastname,
        email: l.user.email,
      },
      leaveType: l.leaveType as import('@repo/dto').LeaveTypeDtoEnum,
      startDate: l.startDate.toISOString().split('T')[0],
      endDate: l.endDate.toISOString().split('T')[0],
      numberOfDays: l.numberOfDays,
      reason: l.reason,
      status: l.status as import('@repo/dto').LeaveStatusDtoEnum,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
