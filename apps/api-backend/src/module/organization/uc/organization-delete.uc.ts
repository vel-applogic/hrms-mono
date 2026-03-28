import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, OrganizationDao, OrganizationHasDocumentDao, OrganizationSettingDao, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseOrganizationUc } from './_base-organization.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class OrganizationDeleteUc extends BaseOrganizationUc implements IUseCase<Params, OperationStatusResponseType> {
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

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.assertSuperAdmin(params.currentUser);
    this.logger.i('Deleting organization', { id: params.id });

    await this.transaction(async (tx) => {
      try {
        await this.organizationDao.deleteByIdOrThrow({ id: params.id, tx });
      } catch (error) {
        if (error instanceof DbRecordNotFoundError) {
          throw new ApiBadRequestError('Organization not found');
        }
        throw error;
      }
    });

    return { success: true, message: 'Organization deleted successfully' };
  }
}
