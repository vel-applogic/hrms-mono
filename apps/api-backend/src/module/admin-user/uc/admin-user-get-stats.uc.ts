import { Injectable } from '@nestjs/common';
import { type Prisma, UserRoleDbEnum } from '@repo/db';
import type { AdminUserStatsResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserGetStatsUc extends BaseAdminUserUc implements IUseCase<Params, AdminUserStatsResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, userDao: UserDao) {
    super(prisma, logger, userDao);
  }

  async execute(params: Params): Promise<AdminUserStatsResponseType> {
    this.logger.i('Get user stats');
    await this.validate(params);
    return this.getStats();
  }

  private async getStats(): Promise<AdminUserStatsResponseType> {
    const totalUsersWhere: Prisma.UserWhereInput = {
      // role: UserRoleDbEnum.admin,
    };

    const totalUsers = await this.userDao.getCount({ where: totalUsersWhere });

    return { totalUsers };
  }

  async validate(_params: Params): Promise<void> {}
}
