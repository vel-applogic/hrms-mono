import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import type {
  LeaveCounterResponseType,
  LeaveCreateRequestType,
  LeaveFilterRequestType,
  LeaveResponseType,
  LeaveUpdateRequestType,
  PaginatedResponseType,
} from '@repo/dto';
import { LeaveCreateRequestSchema, LeaveFilterRequestSchema, LeaveUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { LeaveApproveUc } from './uc/leave-approve.uc.js';
import { LeaveCancelUc } from './uc/leave-cancel.uc.js';
import { LeaveCountersListUc } from './uc/leave-counters-list.uc.js';
import { LeaveRejectUc } from './uc/leave-reject.uc.js';
import { LeaveCreateUc } from './uc/leave-create.uc.js';
import { LeaveListUc } from './uc/leave-list.uc.js';
import { LeaveUpdateUc } from './uc/leave-update.uc.js';

@Controller('api/leave')
export class LeaveController {
  constructor(
    private readonly listUc: LeaveListUc,
    private readonly countersListUc: LeaveCountersListUc,
    private readonly createUc: LeaveCreateUc,
    private readonly updateUc: LeaveUpdateUc,
    private readonly cancelUc: LeaveCancelUc,
    private readonly approveUc: LeaveApproveUc,
    private readonly rejectUc: LeaveRejectUc,
  ) {}

  @Get('/counters')
  async getCounters(
    @Query('financialYear') financialYear: string,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<LeaveCounterResponseType[]> {
    return this.countersListUc.execute({ currentUser, financialYear });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(LeaveFilterRequestSchema)) filterDto: LeaveFilterRequestType,
  ): Promise<PaginatedResponseType<LeaveResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(LeaveCreateRequestSchema)) body: LeaveCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<LeaveResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(LeaveUpdateRequestSchema)) body: LeaveUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<LeaveResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<LeaveResponseType> {
    return this.cancelUc.execute({ currentUser, id });
  }

  @Post(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<LeaveResponseType> {
    return this.approveUc.execute({ currentUser, id });
  }

  @Post(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<LeaveResponseType> {
    return this.rejectUc.execute({ currentUser, id });
  }
}
