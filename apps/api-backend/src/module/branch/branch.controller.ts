import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type { BranchCreateRequestType, BranchFilterRequestType, BranchResponseType, BranchUpdateRequestType, OperationStatusResponseType, PaginatedResponseType } from '@repo/dto';
import { BranchCreateRequestSchema, BranchFilterRequestSchema, BranchUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { BranchCreateUc } from './uc/branch-create.uc.js';
import { BranchDeleteUc } from './uc/branch-delete.uc.js';
import { BranchGetUc } from './uc/branch-get.uc.js';
import { BranchSearchUc } from './uc/branch-search.uc.js';
import { BranchUpdateUc } from './uc/branch-update.uc.js';

@Controller('api/branch')
export class BranchController {
  constructor(
    private readonly branchCreateUc: BranchCreateUc,
    private readonly branchUpdateUc: BranchUpdateUc,
    private readonly branchSearchUc: BranchSearchUc,
    private readonly branchGetUc: BranchGetUc,
    private readonly branchDeleteUc: BranchDeleteUc,
  ) {}

  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(BranchCreateRequestSchema)) dto: BranchCreateRequestType,
  ): Promise<BranchResponseType> {
    return this.branchCreateUc.execute({ currentUser, dto });
  }

  @Put(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(BranchUpdateRequestSchema)) dto: BranchUpdateRequestType,
  ): Promise<BranchResponseType> {
    return this.branchUpdateUc.execute({ currentUser, dto: { ...dto, id } });
  }

  @Patch('search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(BranchFilterRequestSchema)) dto: BranchFilterRequestType,
  ): Promise<PaginatedResponseType<BranchResponseType>> {
    return this.branchSearchUc.execute({ currentUser, dto });
  }

  @Get(':id')
  async getById(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BranchResponseType> {
    return this.branchGetUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OperationStatusResponseType> {
    return this.branchDeleteUc.execute({ currentUser, id });
  }
}
