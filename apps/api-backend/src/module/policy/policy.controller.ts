import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  OperationStatusResponseType,
  PaginatedResponseType,
  PolicyCreateRequestType,
  PolicyDetailResponseType,
  PolicyFilterRequestType,
  PolicyListResponseType,
  PolicyUpdateRequestType,
} from '@repo/dto';
import { PolicyCreateRequestSchema, PolicyFilterRequestSchema, PolicyUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { AdminOnly, CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { PolicyCreateUc } from './uc/policy-create.uc.js';
import { PolicyDeleteUc } from './uc/policy-delete.uc.js';
import { PolicyGetUc } from './uc/policy-get.uc.js';
import { PolicySearchUc } from './uc/policy-search.uc.js';
import { PolicyUpdateUc } from './uc/policy-update.uc.js';

@Controller('api/policy')
export class PolicyController {
  constructor(
    private readonly searchUc: PolicySearchUc,
    private readonly getUc: PolicyGetUc,
    private readonly createUc: PolicyCreateUc,
    private readonly updateUc: PolicyUpdateUc,
    private readonly deleteUc: PolicyDeleteUc,
  ) {}

  @AdminOnly()
  @Post()
  async create(
    @Body(new ZodValidationPipe(PolicyCreateRequestSchema)) body: PolicyCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Patch('/search')
  public async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(PolicyFilterRequestSchema)) filterDto: PolicyFilterRequestType,
  ): Promise<PaginatedResponseType<PolicyListResponseType>> {
    return await this.searchUc.execute({ currentUser, filterDto });
  }

  @AdminOnly()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(PolicyUpdateRequestSchema)) body: PolicyUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<PolicyDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @AdminOnly()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
