import { Body, Controller, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  EmployeeCompensationCreateRequestType,
  EmployeeCompensationFilterRequestType,
  EmployeeCompensationResponseType,
  EmployeeCompensationUpdateRequestType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  EmployeeCompensationCreateRequestSchema,
  EmployeeCompensationFilterRequestSchema,
  EmployeeCompensationUpdateRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { EmployeeCompensationCreateUc } from './uc/employee-compensation-create.uc.js';
import { EmployeeCompensationListUc } from './uc/employee-compensation-list.uc.js';
import { EmployeeCompensationUpdateUc } from './uc/employee-compensation-update.uc.js';

@Controller('api/employee-compensation')
export class EmployeeCompensationController {
  constructor(
    private readonly listUc: EmployeeCompensationListUc,
    private readonly createUc: EmployeeCompensationCreateUc,
    private readonly updateUc: EmployeeCompensationUpdateUc,
  ) {}

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(EmployeeCompensationFilterRequestSchema)) filterDto: EmployeeCompensationFilterRequestType,
  ): Promise<PaginatedResponseType<EmployeeCompensationResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(EmployeeCompensationCreateRequestSchema)) body: EmployeeCompensationCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<EmployeeCompensationResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(EmployeeCompensationUpdateRequestSchema)) body: EmployeeCompensationUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<EmployeeCompensationResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }
}
