import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import type { CountResponseType, NotificationFilterRequestType, NotificationResponseType, OperationStatusResponseType, PaginatedResponseType } from '@repo/dto';
import { NotificationFilterRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { NotificationMarkAllSeenUc } from './uc/notification-mark-all-seen.uc.js';
import { NotificationMarkSeenUc } from './uc/notification-mark-seen.uc.js';
import { NotificationSearchUc } from './uc/notification-search.uc.js';
import { NotificationUnseenCountUc } from './uc/notification-unseen-count.uc.js';

@Controller('api/notification')
export class NotificationController {
  constructor(
    private readonly searchUc: NotificationSearchUc,
    private readonly markSeenUc: NotificationMarkSeenUc,
    private readonly markAllSeenUc: NotificationMarkAllSeenUc,
    private readonly unseenCountUc: NotificationUnseenCountUc,
  ) {}

  @Get('/unseen-count')
  async unseenCount(@CurrentUser() currentUser: CurrentUserType): Promise<CountResponseType> {
    return this.unseenCountUc.execute({ currentUser });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(NotificationFilterRequestSchema)) filterDto: NotificationFilterRequestType,
  ): Promise<PaginatedResponseType<NotificationResponseType>> {
    return this.searchUc.execute({ currentUser, filterDto });
  }

  @Post(':id/mark-seen')
  async markSeen(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.markSeenUc.execute({ currentUser, id });
  }

  @Post('/mark-all-seen')
  async markAllSeen(@CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.markAllSeenUc.execute({ currentUser });
  }
}
