import { Injectable } from '@nestjs/common';
import type { AdminUserDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  id: number;
  currentUser: CurrentUserType;
};
@Injectable()
export class AdminUserGetUc extends BaseAdminUserUc implements IUseCase<Params, AdminUserDetailResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
  userDao: UserDao,
  ) {
    super(prisma, logger, userDao);
  }

  async execute(params: Params): Promise<AdminUserDetailResponseType> {
    this.logger.i('Getting user', { id: params.id });

    const user = await this.validate(params);

    return user;
  }

  async validate(params: Params): Promise<AdminUserDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }
}
