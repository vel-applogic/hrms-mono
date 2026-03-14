import { Injectable } from '@nestjs/common';
import { PlanEnum, type Prisma, UserRoleDbEnum } from '@repo/db';
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
    const now = new Date();

    const totalUsersWhere: Prisma.UserWhereInput = {
      role: UserRoleDbEnum.user,
    };

    const premiumUsersWhere: Prisma.UserWhereInput = {
      role: UserRoleDbEnum.user,
      plan: PlanEnum.premium,
    };

    const freeUsersWhere: Prisma.UserWhereInput = {
      role: UserRoleDbEnum.user,
      plan: PlanEnum.free,
    };

    const [totalUsers, premiumUsers, freeUsers] = await Promise.all([
      this.userDao.getCount({ where: totalUsersWhere }),
      this.userDao.getCount({ where: premiumUsersWhere }),
      this.userDao.getCount({ where: freeUsersWhere }),
    ]);

    return { totalUsers, premiumUsers, freeUsers };
  }

  async validate(_params: Params): Promise<void> {}
}
