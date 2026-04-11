import { Injectable } from '@nestjs/common';
import type { CountResponseType } from '@repo/dto';
import { CommonLoggerService, type CurrentUserType, type IUseCase, NotificationDao, PrismaService } from '@repo/nest-lib';

import { BaseNotificationUseCase } from './_base-notification.uc.js';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class NotificationUnseenCountUc extends BaseNotificationUseCase implements IUseCase<Params, CountResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, notificationDao: NotificationDao) {
    super(prisma, logger, notificationDao);
  }

  public async execute(params: Params): Promise<CountResponseType> {
    const count = await this.notificationDao.unseenCount({
      userId: params.currentUser.id,
      organizationId: params.currentUser.organizationId,
    });

    return { count };
  }
}
