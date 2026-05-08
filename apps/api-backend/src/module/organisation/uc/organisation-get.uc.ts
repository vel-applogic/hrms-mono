import { Injectable } from '@nestjs/common';
import type { OrganisationDetailResponseType } from '@repo/dto';
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

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseOrganisationUc } from './_base-organisation.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class OrganisationGetUc extends BaseOrganisationUc implements IUseCase<Params, OrganisationDetailResponseType> {
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

  public async execute(params: Params): Promise<OrganisationDetailResponseType> {
    this.logger.i('Getting organisation', { id: params.id });
    await this.validate(params);
    return await this.getById(params);
  }

  private async validate(params: Params): Promise<void> {
    this.assertOwnOrganisation(params.currentUser, params.id);
  }

  private async getById(params: Params): Promise<OrganisationDetailResponseType> {
    return await this.getOrganisationDetailById(params.id);
  }
}
