import { Injectable } from '@nestjs/common';
import type { AnnouncementFilterRequestType, AnnouncementResponseType, PaginatedResponseType } from '@repo/dto';
import { AnnouncementSortableColumns } from '@repo/dto';
import { AnnouncementDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseAnnouncementUc } from './_base-announcement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: AnnouncementFilterRequestType;
};

@Injectable()
export class AnnouncementSearchUc extends BaseAnnouncementUc implements IUseCase<Params, PaginatedResponseType<AnnouncementResponseType>> {
  public constructor(prisma: PrismaService, logger: CommonLoggerService, announcementDao: AnnouncementDao) {
    super(prisma, logger, announcementDao);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<AnnouncementResponseType>> {
    this.logger.i('Searching announcements', { filter: params.filterDto });
    const orderBy = this.getSort(params.filterDto.sort, AnnouncementSortableColumns);
    const { dbRecords, totalRecords } = await this.announcementDao.search({
      filterDto: params.filterDto,
      organizationId: params.currentUser.organizationId,
      orderBy,
    });
    const results = dbRecords.map((dbRec) => this.dbToAnnouncementResponse(dbRec));
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
