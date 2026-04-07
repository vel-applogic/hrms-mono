import { Injectable } from '@nestjs/common';
import type { OrganizationDetailResponseType } from '@repo/dto';
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

  public async execute(params: Params): Promise<OrganizationDetailResponseType> {
    this.logger.i('Getting organization', { id: params.id });
    await this.validate(params);
    return await this.getById(params);
  }

  private async validate(params: Params): Promise<void> {
    this.assertOwnOrganization(params.currentUser, params.id);
  }

  private async getById(params: Params): Promise<OrganizationDetailResponseType> {
    return await this.getOrganizationDetailById(params.id);
  }
}
