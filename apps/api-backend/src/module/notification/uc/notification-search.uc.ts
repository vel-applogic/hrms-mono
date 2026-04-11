import { Injectable } from '@nestjs/common';
import type { NotificationFilterRequestType, NotificationResponseType, PaginatedResponseType } from '@repo/dto';
import { CommonLoggerService, type CurrentUserType, type IUseCase, NotificationDao, PrismaService } from '@repo/nest-lib';

import { BaseNotificationUseCase } from './_base-notification.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: NotificationFilterRequestType;
};

@Injectable()
export class NotificationSearchUc extends BaseNotificationUseCase implements IUseCase<Params, PaginatedResponseType<NotificationResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, notificationDao: NotificationDao) {
    super(prisma, logger, notificationDao);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<NotificationResponseType>> {
    const page = params.filterDto.pagination?.page ?? 1;
    const limit = params.filterDto.pagination?.limit ?? 20;

    const { totalRecords, dbRecords } = await this.notificationDao.findManyWithPagination({
      userId: params.currentUser.id,
      organizationId: params.currentUser.organizationId,
      page,
      limit,
    });

    const results = dbRecords.map((dbRec) => this.dbToNotificationResponse(dbRec));

    return { page, limit, totalRecords, results };
  }
}
