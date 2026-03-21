import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  EmployeeDeductionCreateRequestType,
  EmployeeDeductionFilterRequestType,
  EmployeeDeductionResponseType,
  EmployeeDeductionUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  EmployeeDeductionCreateRequestSchema,
  EmployeeDeductionFilterRequestSchema,
  EmployeeDeductionUpdateRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { EmployeeDeductionCreateUc } from './uc/employee-deduction-create.uc.js';
import { EmployeeDeductionDeleteUc } from './uc/employee-deduction-delete.uc.js';
import { EmployeeDeductionListUc } from './uc/employee-deduction-list.uc.js';
import { EmployeeDeductionUpdateUc } from './uc/employee-deduction-update.uc.js';

@Controller('api/employee-deduction')
export class EmployeeDeductionController {
  constructor(
    private readonly listUc: EmployeeDeductionListUc,
    private readonly createUc: EmployeeDeductionCreateUc,
    private readonly updateUc: EmployeeDeductionUpdateUc,
    private readonly deleteUc: EmployeeDeductionDeleteUc,
  ) {}

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(EmployeeDeductionFilterRequestSchema)) filterDto: EmployeeDeductionFilterRequestType,
  ): Promise<PaginatedResponseType<EmployeeDeductionResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(EmployeeDeductionCreateRequestSchema)) body: EmployeeDeductionCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<EmployeeDeductionResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(EmployeeDeductionUpdateRequestSchema)) body: EmployeeDeductionUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<EmployeeDeductionResponseType> {
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
