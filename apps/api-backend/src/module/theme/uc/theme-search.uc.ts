import { Injectable } from '@nestjs/common';
import type { FilterRequestType, PaginatedResponseType,ThemeListResponseType } from '@repo/dto';
import { ThemeSortableColumns } from '@repo/dto';
import type { OrderByParam } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService,ThemeDao } from '@repo/nest-lib';

import { BaseThemeUc } from './_base-theme.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: FilterRequestType
};
@Injectable()
export class ThemeSearchUc extends BaseThemeUc implements IUseCase<Params,  PaginatedResponseType<ThemeListResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    themeDao: ThemeDao,
  ) {
    super(prisma, logger, themeDao);
  }

  async execute(params: Params): Promise<PaginatedResponseType<ThemeListResponseType>> {
    this.logger.i('Listing themes', { filter: params.filterDto });
    
    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      orderBy: this.getSort(params.filterDto.sort, ThemeSortableColumns),
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  public async search(params: { filterDto: FilterRequestType; orderBy?: OrderByParam }): Promise<{ totalRecords: number; results: ThemeListResponseType[] }> {
    const { dbRecords, totalRecords } = await this.themeDao.search({
      filterDto: params.filterDto,
      orderBy: params.orderBy,
    });
    const results: ThemeListResponseType[] = dbRecords.map((p) => this.dbToThemeListResponse(p));
    return { totalRecords, results };
  }

  async validate(params: Params): Promise<void> {}
}
