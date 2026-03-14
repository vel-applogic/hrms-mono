import { Injectable } from '@nestjs/common';
import type { ChapterListResponseType,FilterRequestType, PaginatedResponseType } from '@repo/dto';
import { ChapterSortableColumns } from '@repo/dto';
import type { OrderByParam } from '@repo/nest-lib';
import { ChapterDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseChapterUc } from './_base-chapter.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: FilterRequestType
};
@Injectable()
export class ChapterSearchUc extends BaseChapterUc implements IUseCase<Params,  PaginatedResponseType<ChapterListResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    chapterDao: ChapterDao,
    s3Service: S3Service,
  ) {
    super(prisma, logger, chapterDao, s3Service);
  }

  async execute(params: Params): Promise<PaginatedResponseType<ChapterListResponseType>> {
    this.logger.i('Listing chapters', { filter: params.filterDto });

    await this.validate(params);
    
    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      orderBy: this.getSort(params.filterDto.sort, ChapterSortableColumns),
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  public async search(params: { filterDto: FilterRequestType; orderBy?: OrderByParam }): Promise<{ totalRecords: number; results: ChapterListResponseType[] }> {
    const { dbRecords, totalRecords } = await this.chapterDao.search({
      filterDto: params.filterDto,
      orderBy: params.orderBy,
    });
    const results: ChapterListResponseType[] = dbRecords.map((p) => this.dbToChapterListResponse(p));
    return { totalRecords, results };
  }

  async validate(params: Params): Promise<void> {}
}
