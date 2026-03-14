import { Injectable } from '@nestjs/common';
import type { PaginatedResponseType, TopicFilterRequestType, TopicListResponseType } from '@repo/dto';
import { TopicSortableColumns } from '@repo/dto';
import type { CurrentUserType, OrderByParam } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, PrismaService, TopicDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseTopicUc } from './_base-topic.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: TopicFilterRequestType;
};

@Injectable()
export class TopicSearchUc extends BaseTopicUc implements IUseCase<Params, PaginatedResponseType<TopicListResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, topicDao: TopicDao, s3Service: S3Service) {
    super(prisma, logger, topicDao, s3Service);
  }

  async execute(params: Params): Promise<PaginatedResponseType<TopicListResponseType>> {
    this.logger.i('Listing topics', { filter: params.filterDto });

    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      orderBy: this.getSort(params.filterDto.sort, TopicSortableColumns),
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  async validate(_params: Params): Promise<void> {
    // No validation needed for search
  }

  public async search(params: { filterDto: TopicFilterRequestType; orderBy?: OrderByParam }): Promise<{ totalRecords: number; results: TopicListResponseType[] }> {
    const { dbRecords, totalRecords } = await this.topicDao.search({
      filterDto: params.filterDto,
      orderBy: params.orderBy,
    });
    const results: TopicListResponseType[] = dbRecords.map((p) => this.dbToTopicListResponse(p));
    return { totalRecords, results };
  }
}
