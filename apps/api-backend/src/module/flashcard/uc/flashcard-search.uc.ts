import { Injectable } from '@nestjs/common';
import type { FlashcardFilterRequestType, FlashcardListResponseType, PaginatedResponseType } from '@repo/dto';
import { FlashcardSortableColumns } from '@repo/dto';
import type { OrderByParam } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, FlashcardDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseFlashcardUc } from './_base-flashcard.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: FlashcardFilterRequestType;
};
@Injectable()
export class FlashcardSearchUc extends BaseFlashcardUc implements IUseCase<Params, PaginatedResponseType<FlashcardListResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, flashcardDao: FlashcardDao) {
    super(prisma, logger, flashcardDao);
  }

  async execute(params: Params): Promise<PaginatedResponseType<FlashcardListResponseType>> {
    this.logger.i('Listing flashcards', { filter: params.filterDto });

    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      orderBy: this.getSort(params.filterDto.sort, FlashcardSortableColumns),
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  public async search(params: { filterDto: FlashcardFilterRequestType; orderBy?: OrderByParam }): Promise<{ totalRecords: number; results: FlashcardListResponseType[] }> {
    const { dbRecords, totalRecords } = await this.flashcardDao.search({
      filterDto: params.filterDto,
      orderBy: params.orderBy,
    });
    const results: FlashcardListResponseType[] = dbRecords.map((p) => this.dbToFlashcardListResponse(p));
    return { totalRecords, results };
  }

  async validate(_params: Params): Promise<void> {}
}
