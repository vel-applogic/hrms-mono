import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  EmployeeFeedbackCreateRequestType,
  EmployeeFeedbackFilterRequestType,
  EmployeeFeedbackResponseType,
  EmployeeFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  EmployeeFeedbackCreateRequestSchema,
  EmployeeFeedbackFilterRequestSchema,
  EmployeeFeedbackUpdateRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { AdminOnly, CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { EmployeeFeedbackCreateUc } from './uc/employee-feedback-create.uc.js';
import { EmployeeFeedbackDeleteUc } from './uc/employee-feedback-delete.uc.js';
import { EmployeeFeedbackListUc } from './uc/employee-feedback-list.uc.js';
import { EmployeeFeedbackUpdateUc } from './uc/employee-feedback-update.uc.js';

@Controller('api/employee-feedback')
export class EmployeeFeedbackController {
  constructor(
    private readonly listUc: EmployeeFeedbackListUc,
    private readonly createUc: EmployeeFeedbackCreateUc,
    private readonly updateUc: EmployeeFeedbackUpdateUc,
    private readonly deleteUc: EmployeeFeedbackDeleteUc,
  ) {}

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(EmployeeFeedbackFilterRequestSchema)) filterDto: EmployeeFeedbackFilterRequestType,
  ): Promise<PaginatedResponseType<EmployeeFeedbackResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @AdminOnly()
  @Post()
  async create(
    @Body(new ZodValidationPipe(EmployeeFeedbackCreateRequestSchema)) body: EmployeeFeedbackCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<EmployeeFeedbackResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @AdminOnly()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(EmployeeFeedbackUpdateRequestSchema)) body: EmployeeFeedbackUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<EmployeeFeedbackResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @AdminOnly()
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
