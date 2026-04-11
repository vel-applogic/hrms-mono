import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  CountResponseType,
  ReimbursementAddFeedbackRequestType,
  ReimbursementCreateRequestType,
  ReimbursementDetailResponseType,
  ReimbursementFilterRequestType,
  ReimbursementResponseType,
  ReimbursementUpdateStatusRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  ReimbursementAddFeedbackRequestSchema,
  ReimbursementCreateRequestSchema,
  ReimbursementFilterRequestSchema,
  ReimbursementUpdateStatusRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { ReimbursementAddFeedbackUc } from './uc/reimbursement-add-feedback.uc.js';
import { ReimbursementCreateUc } from './uc/reimbursement-create.uc.js';
import { ReimbursementDeleteFeedbackUc } from './uc/reimbursement-delete-feedback.uc.js';
import { ReimbursementGetUc } from './uc/reimbursement-get.uc.js';
import { ReimbursementListUc } from './uc/reimbursement-list.uc.js';
import { ReimbursementPendingCountUc } from './uc/reimbursement-pending-count.uc.js';
import { ReimbursementUpdateFeedbackUc } from './uc/reimbursement-update-feedback.uc.js';
import { ReimbursementUpdateStatusUc } from './uc/reimbursement-update-status.uc.js';

@Controller('api/reimbursement')
export class ReimbursementController {
  constructor(
    private readonly listUc: ReimbursementListUc,
    private readonly getUc: ReimbursementGetUc,
    private readonly createUc: ReimbursementCreateUc,
    private readonly updateStatusUc: ReimbursementUpdateStatusUc,
    private readonly pendingCountUc: ReimbursementPendingCountUc,
    private readonly addFeedbackUc: ReimbursementAddFeedbackUc,
    private readonly updateFeedbackUc: ReimbursementUpdateFeedbackUc,
    private readonly deleteFeedbackUc: ReimbursementDeleteFeedbackUc,
  ) {}

  @Get('/pending-count')
  async pendingCount(
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<CountResponseType> {
    return this.pendingCountUc.execute({ currentUser });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(ReimbursementFilterRequestSchema)) filterDto: ReimbursementFilterRequestType,
  ): Promise<PaginatedResponseType<ReimbursementResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ReimbursementDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(ReimbursementCreateRequestSchema)) body: ReimbursementCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ReimbursementResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(ReimbursementUpdateStatusRequestSchema)) body: ReimbursementUpdateStatusRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ReimbursementResponseType> {
    return this.updateStatusUc.execute({ currentUser, id, dto: body });
  }

  @Post(':id/feedback')
  async addFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(ReimbursementAddFeedbackRequestSchema)) body: ReimbursementAddFeedbackRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ReimbursementDetailResponseType> {
    return this.addFeedbackUc.execute({ currentUser, id, dto: body });
  }

  @Put(':id/feedback/:feedbackId')
  async updateFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
    @Body(new ZodValidationPipe(ReimbursementAddFeedbackRequestSchema)) body: ReimbursementAddFeedbackRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ReimbursementDetailResponseType> {
    return this.updateFeedbackUc.execute({ currentUser, reimbursementId: id, feedbackId, dto: body });
  }

  @Delete(':id/feedback/:feedbackId')
  async deleteFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.deleteFeedbackUc.execute({ currentUser, reimbursementId: id, feedbackId });
  }
}
