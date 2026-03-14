import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  CandidateFeedbackCreateRequestType,
  CandidateFeedbackFilterRequestType,
  CandidateFeedbackResponseType,
  CandidateFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  CandidateFeedbackCreateRequestSchema,
  CandidateFeedbackFilterRequestSchema,
  CandidateFeedbackUpdateRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { CandidateFeedbackCreateUc } from './uc/candidate-feedback-create.uc.js';
import { CandidateFeedbackDeleteUc } from './uc/candidate-feedback-delete.uc.js';
import { CandidateFeedbackListUc } from './uc/candidate-feedback-list.uc.js';
import { CandidateFeedbackUpdateUc } from './uc/candidate-feedback-update.uc.js';

@Controller('api/candidate-feedback')
export class CandidateFeedbackController {
  constructor(
    private readonly listUc: CandidateFeedbackListUc,
    private readonly createUc: CandidateFeedbackCreateUc,
    private readonly updateUc: CandidateFeedbackUpdateUc,
    private readonly deleteUc: CandidateFeedbackDeleteUc,
  ) {}

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(CandidateFeedbackFilterRequestSchema)) filterDto: CandidateFeedbackFilterRequestType,
  ): Promise<PaginatedResponseType<CandidateFeedbackResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(CandidateFeedbackCreateRequestSchema)) body: CandidateFeedbackCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<CandidateFeedbackResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CandidateFeedbackUpdateRequestSchema)) body: CandidateFeedbackUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<CandidateFeedbackResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
