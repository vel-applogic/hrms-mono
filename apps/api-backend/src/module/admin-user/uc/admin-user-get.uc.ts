import { Injectable } from '@nestjs/common';
import type { AdminUserDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, OrganisationHasUserDao, PrismaService, UserDao } from '@repo/nest-lib';

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
    organisationHasUserDao: OrganisationHasUserDao,
  ) {
    super(prisma, logger, userDao, organisationHasUserDao);
  }

  public async execute(params: Params): Promise<AdminUserDetailResponseType> {
    this.logger.i('Getting user', { id: params.id });
    await this.validate(params);
    return await this.fetchById(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async fetchById(params: Params): Promise<AdminUserDetailResponseType> {
    return await this.getByIdOrThrow(params.id, params.currentUser.organisationId);
  }
}
