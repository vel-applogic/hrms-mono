import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  EmployeeBgvFeedbackCreateRequestType,
  EmployeeBgvFeedbackFilterRequestType,
  EmployeeBgvFeedbackResponseType,
  EmployeeBgvFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  EmployeeBgvFeedbackCreateRequestSchema,
  EmployeeBgvFeedbackFilterRequestSchema,
  EmployeeBgvFeedbackUpdateRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { EmployeeBgvFeedbackCreateUc } from './uc/employee-bgv-feedback-create.uc.js';
import { EmployeeBgvFeedbackDeleteUc } from './uc/employee-bgv-feedback-delete.uc.js';
import { EmployeeBgvFeedbackListUc } from './uc/employee-bgv-feedback-list.uc.js';
import { EmployeeBgvFeedbackUpdateUc } from './uc/employee-bgv-feedback-update.uc.js';

@Controller('api/employee-bgv-feedback')
export class EmployeeBgvFeedbackController {
  constructor(
    private readonly listUc: EmployeeBgvFeedbackListUc,
    private readonly createUc: EmployeeBgvFeedbackCreateUc,
    private readonly updateUc: EmployeeBgvFeedbackUpdateUc,
    private readonly deleteUc: EmployeeBgvFeedbackDeleteUc,
  ) {}

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(EmployeeBgvFeedbackFilterRequestSchema)) filterDto: EmployeeBgvFeedbackFilterRequestType,
  ): Promise<PaginatedResponseType<EmployeeBgvFeedbackResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(EmployeeBgvFeedbackCreateRequestSchema)) body: EmployeeBgvFeedbackCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<EmployeeBgvFeedbackResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(EmployeeBgvFeedbackUpdateRequestSchema)) body: EmployeeBgvFeedbackUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<EmployeeBgvFeedbackResponseType> {
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
