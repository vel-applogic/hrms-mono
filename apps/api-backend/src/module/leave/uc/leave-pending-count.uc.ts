import { Injectable } from '@nestjs/common';
import type { CountResponseType } from '@repo/dto';
import { UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, LeaveDao, leaveStatusDtoEnumToDbEnum, PrismaService } from '@repo/nest-lib';
import { LeaveStatusDtoEnum } from '@repo/dto';
import { BaseUc } from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
  userId?: number;
};

@Injectable()
export class LeavePendingCountUc extends BaseUc implements IUseCase<Params, CountResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly leaveDao: LeaveDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<CountResponseType> {
    this.logger.i('Counting pending leaves');

    const isAdmin = params.currentUser.isSuperAdmin || params.currentUser.roles.includes(UserRoleDtoEnum.admin);
    const userId = isAdmin ? params.userId : params.currentUser.id;

    const count = await this.leaveDao.count({
      organizationId: params.currentUser.organizationId,
      where: {
        status: leaveStatusDtoEnumToDbEnum(LeaveStatusDtoEnum.pending),
        ...(userId ? { userId } : {}),
      },
    });

    return { count };
  }
}
