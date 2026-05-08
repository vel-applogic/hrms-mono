import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OperationStatusResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import {
  AddressDao,
  CommonLoggerService,
  ContactDao,
  IUseCase,
  OrganisationDao,
  OrganisationHasAddressDao,
  OrganisationHasContactDao,
  OrganisationHasDocumentDao,
  OrganisationSettingDao,
  PrismaService,
} from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseOrganisationUc } from './_base-organisation.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class OrganisationDeleteUc extends BaseOrganisationUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organisationDao: OrganisationDao,
    organisationSettingDao: OrganisationSettingDao,
    organisationHasDocumentDao: OrganisationHasDocumentDao,
    organisationHasAddressDao: OrganisationHasAddressDao,
    organisationHasContactDao: OrganisationHasContactDao,
    addressDao: AddressDao,
    contactDao: ContactDao,
    s3Service: S3Service,
  ) {
    super(
      prisma,
      logger,
      organisationDao,
      organisationSettingDao,
      organisationHasDocumentDao,
      organisationHasAddressDao,
      organisationHasContactDao,
      addressDao,
      contactDao,
      s3Service,
    );
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting organisation', { id: params.id });
    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.delete(params, tx);
    });

    return { success: true, message: 'Organisation deleted successfully' };
  }

  private async validate(params: Params): Promise<void> {
    this.assertSuperAdmin(params.currentUser);
  }

  private async delete(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    try {
      await this.organisationDao.deleteByIdOrThrow({ id: params.id, tx });
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Organisation not found');
      }
      throw error;
    }
  }
}
