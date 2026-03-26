import { Injectable } from '@nestjs/common';
import type { OrganizationResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, OrganizationDao, PrismaService } from '@repo/nest-lib';

import { BaseOrganizationUc } from './_base-organization.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class OrganizationGetUc extends BaseOrganizationUc implements IUseCase<Params, OrganizationResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organizationDao: OrganizationDao,
  ) {
    super(prisma, logger, organizationDao);
  }

  async execute(params: Params): Promise<OrganizationResponseType> {
    this.assertSuperAdmin(params.currentUser);
    this.logger.i('Getting organization', { id: params.id });
    return await this.getOrganizationResponseById(params.id);
  }
}
