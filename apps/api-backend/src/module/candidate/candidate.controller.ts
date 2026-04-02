import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  CandidateConvertToEmployeeRequestType,
  CandidateCreateRequestType,
  CandidateDetailResponseType,
  CandidateFilterRequestType,
  CandidateListResponseType,
  CandidateUpdateDocumentsRequestType,
  CandidateUpdateProgressRequestType,
  CandidateUpdateRequestType,
  CandidateUpdateStatusRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  CandidateConvertToEmployeeRequestSchema,
  CandidateCreateRequestSchema,
  CandidateFilterRequestSchema,
  CandidateUpdateDocumentsRequestSchema,
  CandidateUpdateProgressRequestSchema,
  CandidateUpdateRequestSchema,
  CandidateUpdateStatusRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { CandidateConvertToEmployeeUc } from './uc/candidate-convert-to-employee.uc.js';
import { CandidateCreateUc } from './uc/candidate-create.uc.js';
import { CandidateDeleteUc } from './uc/candidate-delete.uc.js';
import { CandidateGetUc } from './uc/candidate-get.uc.js';
import { CandidateSearchUc } from './uc/candidate-search.uc.js';
import { CandidateUpdateUc } from './uc/candidate-update.uc.js';
import { CandidateUpdateDocumentsUc } from './uc/candidate-update-documents.uc.js';
import { CandidateUpdateProgressUc } from './uc/candidate-update-progress.uc.js';
import { CandidateUpdateStatusUc } from './uc/candidate-update-status.uc.js';

@Controller('api/candidate')
export class CandidateController {
  constructor(
    private readonly searchUc: CandidateSearchUc,
    private readonly getUc: CandidateGetUc,
    private readonly createUc: CandidateCreateUc,
    private readonly updateUc: CandidateUpdateUc,
    private readonly updateDocumentsUc: CandidateUpdateDocumentsUc,
    private readonly updateStatusUc: CandidateUpdateStatusUc,
    private readonly updateProgressUc: CandidateUpdateProgressUc,
    private readonly convertToEmployeeUc: CandidateConvertToEmployeeUc,
    private readonly deleteUc: CandidateDeleteUc,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CandidateCreateRequestSchema)) body: CandidateCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CandidateUpdateRequestSchema)) body: CandidateUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch(':id/documents')
  async updateDocuments(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CandidateUpdateDocumentsRequestSchema)) body: CandidateUpdateDocumentsRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateDocumentsUc.execute({ currentUser, id, dto: body });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CandidateUpdateStatusRequestSchema)) body: CandidateUpdateStatusRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateStatusUc.execute({ currentUser, id, dto: body });
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CandidateUpdateProgressRequestSchema)) body: CandidateUpdateProgressRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateProgressUc.execute({ currentUser, id, dto: body });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(CandidateFilterRequestSchema)) filterDto: CandidateFilterRequestType,
  ): Promise<PaginatedResponseType<CandidateListResponseType>> {
    return this.searchUc.execute({ currentUser, filterDto });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<CandidateDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Post(':id/convert-to-employee')
  async convertToEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CandidateConvertToEmployeeRequestSchema)) body: CandidateConvertToEmployeeRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.convertToEmployeeUc.execute({ currentUser, id, dto: body });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
