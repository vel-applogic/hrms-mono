import { Injectable } from '@nestjs/common';
import type { PaginatedResponseType, PolicyFilterRequestType, PolicyListResponseType } from '@repo/dto';
import { PolicySortableColumns } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PolicyDao, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BasePolicyUc } from './_base-policy.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: PolicyFilterRequestType;
};

@Injectable()
export class PolicySearchUc extends BasePolicyUc implements IUseCase<Params, PaginatedResponseType<PolicyListResponseType>> {
  public constructor(prisma: PrismaService, logger: CommonLoggerService, policyDao: PolicyDao, s3Service: S3Service) {
    super(prisma, logger, policyDao, s3Service);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<PolicyListResponseType>> {
    this.logger.i('Listing policies', { filter: params.filterDto });
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async search(params: Params): Promise<PaginatedResponseType<PolicyListResponseType>> {
    const orderBy = this.getSort(params.filterDto.sort, PolicySortableColumns);
    const { dbRecords, totalRecords } = await this.policyDao.search({
      filterDto: params.filterDto,
      organizationId: params.currentUser.organizationId,
      orderBy,
    });
    const results: PolicyListResponseType[] = dbRecords.map((p) => this.dbToPolicyListResponse(p));
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
