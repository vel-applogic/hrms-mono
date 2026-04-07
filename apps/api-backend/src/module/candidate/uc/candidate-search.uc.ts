import { Injectable } from '@nestjs/common';
import type { CandidateFilterRequestType, CandidateListResponseType, PaginatedResponseType } from '@repo/dto';
import { CandidateSortableColumns } from '@repo/dto';
import type { CandidateListRecordType, OrderByParam } from '@repo/nest-lib';
import { CandidateDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseCandidateUc } from './_base-candidate.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: CandidateFilterRequestType;
};

@Injectable()
export class CandidateSearchUc extends BaseCandidateUc implements IUseCase<Params, PaginatedResponseType<CandidateListResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, candidateDao: CandidateDao, s3Service: S3Service) {
    super(prisma, logger, candidateDao, s3Service);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<CandidateListResponseType>> {
    this.logger.i('Listing candidates', { filter: params.filterDto });
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async search(params: Params): Promise<PaginatedResponseType<CandidateListResponseType>> {
    const { results, totalRecords } = await this.runSearch({
      filterDto: params.filterDto,
      organizationId: params.currentUser.organizationId,
      orderBy: this.getSort(params.filterDto.sort, CandidateSortableColumns),
    });

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  private async runSearch(params: {
    filterDto: CandidateFilterRequestType;
    organizationId: number;
    orderBy?: OrderByParam;
  }): Promise<{ totalRecords: number; results: CandidateListResponseType[] }> {
    const { dbRecords, totalRecords } = await this.candidateDao.search({
      filterDto: params.filterDto,
      organizationId: params.organizationId,
      orderBy: params.orderBy,
    });
    return { totalRecords, results: dbRecords.map((r: CandidateListRecordType) => this.dbToCandidateListResponse(r)) };
  }
}
