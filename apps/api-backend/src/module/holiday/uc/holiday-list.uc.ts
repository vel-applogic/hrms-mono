import { Injectable } from '@nestjs/common';
import type { HolidayFilterRequestType, HolidayResponseType, PaginatedResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, HolidayDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseHolidayUseCase } from './_base-holiday.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: HolidayFilterRequestType;
};

@Injectable()
export class HolidayListUc extends BaseHolidayUseCase implements IUseCase<Params, PaginatedResponseType<HolidayResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, holidayDao: HolidayDao) {
    super(prisma, logger, holidayDao);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<HolidayResponseType>> {
    this.logger.i('Listing holidays');
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async search(params: Params): Promise<PaginatedResponseType<HolidayResponseType>> {
    const { dbRecords, totalRecords } = await this.holidayDao.search({
      organizationId: params.currentUser.organizationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      search: params.filterDto.search,
      year: params.filterDto.year,
    });

    const results = dbRecords.map((dbRec) => this.dbToHolidayResponse(dbRec));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
