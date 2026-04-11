import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type { DepartmentCreateRequestType, DepartmentFilterRequestType, DepartmentResponseType, DepartmentUpdateRequestType, OperationStatusResponseType, PaginatedResponseType } from '@repo/dto';
import { DepartmentCreateRequestSchema, DepartmentFilterRequestSchema, DepartmentUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { DepartmentCreateUc } from './uc/department-create.uc.js';
import { DepartmentDeleteUc } from './uc/department-delete.uc.js';
import { DepartmentGetUc } from './uc/department-get.uc.js';
import { DepartmentSearchUc } from './uc/department-search.uc.js';
import { DepartmentUpdateUc } from './uc/department-update.uc.js';

@Controller('api/department')
export class DepartmentController {
  constructor(
    private readonly departmentCreateUc: DepartmentCreateUc,
    private readonly departmentUpdateUc: DepartmentUpdateUc,
    private readonly departmentSearchUc: DepartmentSearchUc,
    private readonly departmentGetUc: DepartmentGetUc,
    private readonly departmentDeleteUc: DepartmentDeleteUc,
  ) {}

  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(DepartmentCreateRequestSchema)) dto: DepartmentCreateRequestType,
  ): Promise<DepartmentResponseType> {
    return this.departmentCreateUc.execute({ currentUser, dto });
  }

  @Put(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(DepartmentUpdateRequestSchema)) dto: DepartmentUpdateRequestType,
  ): Promise<DepartmentResponseType> {
    return this.departmentUpdateUc.execute({ currentUser, dto: { ...dto, id } });
  }

  @Patch('search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(DepartmentFilterRequestSchema)) dto: DepartmentFilterRequestType,
  ): Promise<PaginatedResponseType<DepartmentResponseType>> {
    return this.departmentSearchUc.execute({ currentUser, dto });
  }

  @Get(':id')
  async getById(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DepartmentResponseType> {
    return this.departmentGetUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OperationStatusResponseType> {
    return this.departmentDeleteUc.execute({ currentUser, id });
  }
}
