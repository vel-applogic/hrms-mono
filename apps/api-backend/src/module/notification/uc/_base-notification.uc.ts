import { Injectable } from '@nestjs/common';
import type { NotificationResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, NotificationDao, NotificationSelectTableRecordType, PrismaService, notificationLinkDbEnumToDtoEnum } from '@repo/nest-lib';

@Injectable()
export class BaseNotificationUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly notificationDao: NotificationDao,
  ) {
    super(prisma, logger);
  }

  protected dbToNotificationResponse(dbRec: NotificationSelectTableRecordType): NotificationResponseType {
    return {
      id: dbRec.id,
      userId: dbRec.userId,
      title: dbRec.title,
      message: dbRec.message,
      link: notificationLinkDbEnumToDtoEnum(dbRec.link),
      isSeen: dbRec.isSeen,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }
}
