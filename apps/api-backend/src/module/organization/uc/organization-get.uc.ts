import { Injectable } from '@nestjs/common';
import type { OrganizationDetailResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, OrganizationDao, OrganizationHasDocumentDao, OrganizationSettingDao, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseOrganizationUc } from './_base-organization.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class OrganizationGetUc extends BaseOrganizationUc implements IUseCase<Params, OrganizationDetailResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organizationDao: OrganizationDao,
    organizationSettingDao: OrganizationSettingDao,
    organizationHasDocumentDao: OrganizationHasDocumentDao,
    s3Service: S3Service,
  ) {
    super(prisma, logger, organizationDao, organizationSettingDao, organizationHasDocumentDao, s3Service);
  }

  async execute(params: Params): Promise<OrganizationDetailResponseType> {
    this.assertSuperAdmin(params.currentUser);
    this.logger.i('Getting organization', { id: params.id });
    return await this.getOrganizationDetailById(params.id);
  }
}
