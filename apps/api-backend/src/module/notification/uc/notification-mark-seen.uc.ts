import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, type CurrentUserType, type IUseCase, NotificationDao, PrismaService } from '@repo/nest-lib';

import { BaseNotificationUseCase } from './_base-notification.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class NotificationMarkSeenUc extends BaseNotificationUseCase implements IUseCase<Params, OperationStatusResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, notificationDao: NotificationDao) {
    super(prisma, logger, notificationDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    await this.prisma.$transaction(async (tx) => {
      await this.notificationDao.markAsSeen({
        id: params.id,
        userId: params.currentUser.id,
        organizationId: params.currentUser.organizationId,
        tx,
      });
    });

    return { success: true, message: 'Notification marked as seen' };
  }
}
