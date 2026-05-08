import { Injectable } from '@nestjs/common';
import type { OrganisationFilterRequestType, OrganisationResponseType, PaginatedResponseType } from '@repo/dto';
import { OrganisationSortableColumns } from '@repo/dto';
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
  filterDto: OrganisationFilterRequestType;
};

@Injectable()
export class OrganisationSearchUc extends BaseOrganisationUc implements IUseCase<Params, PaginatedResponseType<OrganisationResponseType>> {
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

  public async execute(params: Params): Promise<PaginatedResponseType<OrganisationResponseType>> {
    this.logger.i('Searching organisations', { filter: params.filterDto });
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(params: Params): Promise<void> {
    this.assertSuperAdmin(params.currentUser);
  }

  private async search(params: Params): Promise<PaginatedResponseType<OrganisationResponseType>> {
    const orderBy = this.getSort(params.filterDto.sort, OrganisationSortableColumns);
    const { dbRecords, totalRecords } = await this.organisationDao.search({
      filterDto: params.filterDto,
      orderBy,
    });

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results: dbRecords.map((r) => this.dbToOrganisationResponse(r)),
    };
  }
}
