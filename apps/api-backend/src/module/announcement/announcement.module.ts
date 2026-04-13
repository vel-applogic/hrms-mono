import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ServiceModule } from '#src/service/service.module.js';

import { AnnouncementController } from './announcement.controller.js';
import { AnnouncementNotificationCron } from './announcement-notification.cron.js';
import { AnnouncementCreateUc } from './uc/announcement-create.uc.js';
import { AnnouncementDeleteUc } from './uc/announcement-delete.uc.js';
import { AnnouncementGetUc } from './uc/announcement-get.uc.js';
import { AnnouncementSearchUc } from './uc/announcement-search.uc.js';
import { AnnouncementUpdateUc } from './uc/announcement-update.uc.js';

@Module({
  imports: [ScheduleModule.forRoot(), ServiceModule],
  controllers: [AnnouncementController],
  providers: [AnnouncementSearchUc, AnnouncementGetUc, AnnouncementCreateUc, AnnouncementUpdateUc, AnnouncementDeleteUc, AnnouncementNotificationCron],
})
export class AnnouncementModule {}
