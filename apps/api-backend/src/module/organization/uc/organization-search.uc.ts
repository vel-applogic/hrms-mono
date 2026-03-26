import { Injectable } from '@nestjs/common';
import type { OrganizationFilterRequestType, OrganizationResponseType, PaginatedResponseType } from '@repo/dto';
import { OrganizationSortableColumns } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, OrganizationDao, PrismaService } from '@repo/nest-lib';

import { BaseOrganizationUc } from './_base-organization.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: OrganizationFilterRequestType;
};

@Injectable()
export class OrganizationSearchUc extends BaseOrganizationUc implements IUseCase<Params, PaginatedResponseType<OrganizationResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organizationDao: OrganizationDao,
  ) {
    super(prisma, logger, organizationDao);
  }

  async execute(params: Params): Promise<PaginatedResponseType<OrganizationResponseType>> {
    this.assertSuperAdmin(params.currentUser);
    this.logger.i('Searching organizations', { filter: params.filterDto });

    const orderBy = this.getSort(params.filterDto.sort, OrganizationSortableColumns);
    const { dbRecords, totalRecords } = await this.organizationDao.search({
      filterDto: params.filterDto,
      orderBy,
    });

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results: dbRecords.map((r) => this.dbToOrganizationResponse(r)),
    };
  }
}
