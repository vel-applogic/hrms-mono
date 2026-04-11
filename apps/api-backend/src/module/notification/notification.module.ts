import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller.js';
import { NotificationMarkAllSeenUc } from './uc/notification-mark-all-seen.uc.js';
import { NotificationMarkSeenUc } from './uc/notification-mark-seen.uc.js';
import { NotificationSearchUc } from './uc/notification-search.uc.js';
import { NotificationUnseenCountUc } from './uc/notification-unseen-count.uc.js';

@Module({
  controllers: [NotificationController],
  providers: [NotificationSearchUc, NotificationMarkSeenUc, NotificationMarkAllSeenUc, NotificationUnseenCountUc],
})
export class NotificationModule {}
