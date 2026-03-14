import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  EmployeeCreateRequestType,
  EmployeeDetailResponseType,
  EmployeeFilterRequestType,
  EmployeeListResponseType,
  EmployeeUpdateDocumentsRequestType,
  EmployeeUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  EmployeeCreateRequestSchema,
  EmployeeFilterRequestSchema,
  EmployeeUpdateDocumentsRequestSchema,
  EmployeeUpdateRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { EmployeeCreateUc } from './uc/employee-create.uc.js';
import { EmployeeDeleteUc } from './uc/employee-delete.uc.js';
import { EmployeeGetUc } from './uc/employee-get.uc.js';
import { EmployeeSearchUc } from './uc/employee-search.uc.js';
import { EmployeeUpdateUc } from './uc/employee-update.uc.js';
import { EmployeeUpdateDocumentsUc } from './uc/employee-update-documents.uc.js';

@Controller('api/employee')
export class EmployeeController {
  constructor(
    private readonly searchUc: EmployeeSearchUc,
    private readonly getUc: EmployeeGetUc,
    private readonly createUc: EmployeeCreateUc,
    private readonly updateUc: EmployeeUpdateUc,
    private readonly updateDocumentsUc: EmployeeUpdateDocumentsUc,
    private readonly deleteUc: EmployeeDeleteUc,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(EmployeeCreateRequestSchema)) body: EmployeeCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(EmployeeUpdateRequestSchema)) body: EmployeeUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch(':id/documents')
  async updateDocuments(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(EmployeeUpdateDocumentsRequestSchema)) body: EmployeeUpdateDocumentsRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateDocumentsUc.execute({ currentUser, id, dto: body });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(EmployeeFilterRequestSchema)) filterDto: EmployeeFilterRequestType,
  ): Promise<PaginatedResponseType<EmployeeListResponseType>> {
    return this.searchUc.execute({ currentUser, filterDto });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<EmployeeDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
