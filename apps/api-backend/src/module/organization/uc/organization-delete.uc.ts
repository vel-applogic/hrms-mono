import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OperationStatusResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import {
  AddressDao,
  CommonLoggerService,
  ContactDao,
  IUseCase,
  OrganizationDao,
  OrganizationHasAddressDao,
  OrganizationHasContactDao,
  OrganizationHasDocumentDao,
  OrganizationSettingDao,
  PrismaService,
} from '@repo/nest-lib';
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
    organizationHasAddressDao: OrganizationHasAddressDao,
    organizationHasContactDao: OrganizationHasContactDao,
    addressDao: AddressDao,
    contactDao: ContactDao,
    s3Service: S3Service,
  ) {
    super(
      prisma,
      logger,
      organizationDao,
      organizationSettingDao,
      organizationHasDocumentDao,
      organizationHasAddressDao,
      organizationHasContactDao,
      addressDao,
      contactDao,
      s3Service,
    );
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting organization', { id: params.id });
    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.delete(params, tx);
    });

    return { success: true, message: 'Organization deleted successfully' };
  }

  private async validate(params: Params): Promise<void> {
    this.assertSuperAdmin(params.currentUser);
  }

  private async delete(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    try {
      await this.organizationDao.deleteByIdOrThrow({ id: params.id, tx });
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Organization not found');
      }
      throw error;
    }
  }
}
