import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, type CurrentUserType, type IUseCase, NotificationDao, PrismaService } from '@repo/nest-lib';

import { BaseNotificationUseCase } from './_base-notification.uc.js';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class NotificationMarkAllSeenUc extends BaseNotificationUseCase implements IUseCase<Params, OperationStatusResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, notificationDao: NotificationDao) {
    super(prisma, logger, notificationDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    await this.prisma.$transaction(async (tx) => {
      await this.notificationDao.markAllAsSeen({
        userId: params.currentUser.id,
        organizationId: params.currentUser.organizationId,
        tx,
      });
    });

    return { success: true, message: 'All notifications marked as seen' };
  }
}
