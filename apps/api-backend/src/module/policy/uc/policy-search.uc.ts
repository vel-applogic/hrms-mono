import { Injectable } from '@nestjs/common';
import type { PaginatedResponseType, PolicyFilterRequestType, PolicyListResponseType } from '@repo/dto';
import { PolicySortableColumns } from '@repo/dto';
import type { OrderByParam } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, PolicyDao, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BasePolicyUc } from './_base-policy.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: PolicyFilterRequestType;
};

@Injectable()
export class PolicySearchUc extends BasePolicyUc implements IUseCase<Params, PaginatedResponseType<PolicyListResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, policyDao: PolicyDao, s3Service: S3Service) {
    super(prisma, logger, policyDao, s3Service);
  }

  async execute(params: Params): Promise<PaginatedResponseType<PolicyListResponseType>> {
    this.logger.i('Listing policies', { filter: params.filterDto });

    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      organizationId: params.currentUser.organizationId,
      orderBy: this.getSort(params.filterDto.sort, PolicySortableColumns),
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  public async search(params: {
    filterDto: PolicyFilterRequestType;
    organizationId: number;
    orderBy?: OrderByParam;
  }): Promise<{ totalRecords: number; results: PolicyListResponseType[] }> {
    const { dbRecords, totalRecords } = await this.policyDao.search({
      filterDto: params.filterDto,
      organizationId: params.organizationId,
      orderBy: params.orderBy,
    });
    const results: PolicyListResponseType[] = dbRecords.map((p) => this.dbToPolicyListResponse(p));
    return { totalRecords, results };
  }

  async validate(_params: Params): Promise<void> {}
}
