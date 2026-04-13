import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationLinkDtoEnum } from '@repo/dto';
import { AnnouncementDao, CommonLoggerService, EmployeeDao, NotificationService, PrismaService } from '@repo/nest-lib';

@Injectable()
export class AnnouncementNotificationCron {
  constructor(
    private readonly announcementDao: AnnouncementDao,
    private readonly employeeDao: EmployeeDao,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAnnouncementNotifications(): Promise<void> {
    try {
      const pendingAnnouncements = await this.announcementDao.findPendingNotifications({});

      if (!pendingAnnouncements.length) {
        return;
      }

      this.logger.i('Processing announcement notifications', { count: pendingAnnouncements.length });

      for (const announcement of pendingAnnouncements) {
        try {
          const userIds = await this.employeeDao.findActiveUserIdsByFilter({
            organizationId: announcement.organizationId,
            branchId: announcement.branchId,
            departmentId: announcement.departmentId,
          });

          if (userIds.length > 0) {
            await this.notificationService.sendToMany({
              organizationId: announcement.organizationId,
              userIds,
              title: announcement.title,
              message: `New announcement: ${announcement.title}`,
              link: NotificationLinkDtoEnum.empAnnouncement,
            });
          }

          await this.prisma.$transaction(async (tx) => {
            await this.announcementDao.markNotificationSent({ id: announcement.id, tx });
          });

          this.logger.i('Announcement notification sent', {
            announcementId: announcement.id,
            recipientCount: userIds.length,
          });
        } catch {
          this.logger.e('Failed to process announcement notification', {
            announcementId: announcement.id,
          });
        }
      }
    } catch {
      this.logger.e('Failed to run announcement notification cron');
    }
  }
}
