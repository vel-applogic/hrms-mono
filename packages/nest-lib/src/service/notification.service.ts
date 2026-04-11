import { Injectable } from '@nestjs/common';
import type { NotificationLinkDtoEnum } from '@repo/dto';

import { CommonLoggerService } from '../logger/logger.service.js';
import { NotificationDao } from '../db/dao/notification.dao.js';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { notificationLinkDtoEnumToDbEnum } from '../util/enum.util.js';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationDao: NotificationDao,
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
  ) {}

  public async send(params: {
    organizationId: number;
    userId: number;
    title: string;
    message: string;
    link: NotificationLinkDtoEnum;
  }): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.notificationDao.create({
          data: {
            organizationId: params.organizationId,
            userId: params.userId,
            title: params.title,
            message: params.message,
            link: notificationLinkDtoEnumToDbEnum(params.link),
          },
          tx,
        });
      });
    } catch {
      this.logger.e('Failed to send notification', { userId: params.userId });
    }
  }

  public async sendToMany(params: {
    organizationId: number;
    userIds: number[];
    title: string;
    message: string;
    link: NotificationLinkDtoEnum;
  }): Promise<void> {
    try {
      const data = params.userIds.map((userId) => ({
        organizationId: params.organizationId,
        userId,
        title: params.title,
        message: params.message,
        link: notificationLinkDtoEnumToDbEnum(params.link),
      }));
      await this.prisma.$transaction(async (tx) => {
        await this.notificationDao.createMany({ data, tx });
      });
    } catch {
      this.logger.e('Failed to send notifications', { userIds: params.userIds });
    }
  }
}
