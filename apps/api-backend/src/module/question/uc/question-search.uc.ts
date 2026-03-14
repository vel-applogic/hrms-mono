import { Injectable } from '@nestjs/common';
import type { PaginatedResponseType, QuestionFilterRequestType, QuestionListResponseType } from '@repo/dto';
import { QuestionSortableColumns } from '@repo/dto';
import type { OrderByParam } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, QuestionDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseQuestionUc } from './_base-question.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: QuestionFilterRequestType;
};
@Injectable()
export class QuestionSearchUc extends BaseQuestionUc implements IUseCase<Params,  PaginatedResponseType<QuestionListResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    questionDao: QuestionDao,
    s3Service: S3Service,
  ) {
    super(prisma, logger, questionDao, s3Service);
  }

  async execute(params: Params): Promise<PaginatedResponseType<QuestionListResponseType>> {
    this.logger.i('Listing questions', { filter: params.filterDto });
    
    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      orderBy: this.getSort(params.filterDto.sort, QuestionSortableColumns),
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  public async search(params: { filterDto: QuestionFilterRequestType; orderBy?: OrderByParam }): Promise<{ totalRecords: number; results: QuestionListResponseType[] }> {
    const { dbRecords, totalRecords } = await this.questionDao.search({
      filterDto: params.filterDto,
      orderBy: params.orderBy,
    });
    const results: QuestionListResponseType[] = dbRecords.map((p) => this.dbToQuestionListResponse(p));
    return { totalRecords, results };
  }

  async validate(params: Params): Promise<void> {}
}
