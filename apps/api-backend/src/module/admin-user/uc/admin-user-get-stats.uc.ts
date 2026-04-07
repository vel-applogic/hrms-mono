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

  public async execute(params: Params): Promise<AdminUserStatsResponseType> {
    this.logger.i('Get admin user stats');
    await this.validate(params);
    return await this.getStats(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async getStats(params: Params): Promise<AdminUserStatsResponseType> {
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
