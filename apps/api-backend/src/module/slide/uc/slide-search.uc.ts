import { Injectable } from '@nestjs/common';
import type { PaginatedResponseType, SlideFilterRequestType, SlideListResponseType } from '@repo/dto';
import { SlideSortableColumns } from '@repo/dto';
import type { OrderByParam } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, SlideDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseSlideUc } from './_base-slide.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: SlideFilterRequestType;
};
@Injectable()
export class SlideSearchUc extends BaseSlideUc implements IUseCase<Params,  PaginatedResponseType<SlideListResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    slideDao: SlideDao,
    s3Service: S3Service,
  ) {
    super(prisma, logger, slideDao, s3Service);
  }

  async execute(params: Params): Promise<PaginatedResponseType<SlideListResponseType>> {
    this.logger.i('Listing slides', { filter: params.filterDto });
    
    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      orderBy: this.getSort(params.filterDto.sort, SlideSortableColumns),
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  public async search(params: { filterDto: SlideFilterRequestType; orderBy?: OrderByParam }): Promise<{ totalRecords: number; results: SlideListResponseType[] }> {
    const { dbRecords, totalRecords } = await this.slideDao.search({
      filterDto: params.filterDto,
      orderBy: params.orderBy,
    });
    const results: SlideListResponseType[] = dbRecords.map((p) => this.dbToSlideListResponse(p));
    return { totalRecords, results };
  }

  async validate(params: Params): Promise<void> {}
}
