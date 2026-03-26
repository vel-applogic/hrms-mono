import { Injectable } from '@nestjs/common';
import type { OrganizationResponseType, OrganizationUpdateRequestType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, OrganizationDao, PrismaService } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { BaseOrganizationUc } from './_base-organization.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: OrganizationUpdateRequestType;
};

@Injectable()
export class OrganizationUpdateUc extends BaseOrganizationUc implements IUseCase<Params, OrganizationResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organizationDao: OrganizationDao,
  ) {
    super(prisma, logger, organizationDao);
  }

  async execute(params: Params): Promise<OrganizationResponseType> {
    this.assertSuperAdmin(params.currentUser);
    this.logger.i('Updating organization', { id: params.dto.id });

    const existing = await this.organizationDao.findByName({ name: params.dto.name });
    if (existing && existing.id !== params.dto.id) {
      throw new ApiFieldValidationError('name', 'Organization name already exists');
    }

    await this.transaction(async (tx) => {
      await this.organizationDao.update({
        id: params.dto.id,
        data: { name: params.dto.name },
        tx,
      });
    });

    return await this.getOrganizationResponseById(params.dto.id);
  }
}
