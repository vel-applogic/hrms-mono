import { Injectable } from '@nestjs/common';
import type { AdminUserStatsResponseType } from '@repo/dto';
import { UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, OrganizationHasUserDao, PrismaService, UserDao, userRoleDtoEnumToDbEnum } from '@repo/nest-lib';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserGetStatsUc extends BaseAdminUserUc implements IUseCase<Params, AdminUserStatsResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    organizationHasUserDao: OrganizationHasUserDao,
  ) {
    super(prisma, logger, userDao, organizationHasUserDao);
  }

  async execute(params: Params): Promise<AdminUserStatsResponseType> {
    this.logger.i('Get admin user stats');
    const totalUsers = await this.userDao.getCount({
      where: {
        organizationHasUsers: {
          some: {
            organizationId: params.currentUser.organizationId,
            roles: { has: userRoleDtoEnumToDbEnum(UserRoleDtoEnum.admin) },
          },
        },
      },
    });
    return { totalUsers };
  }
}
