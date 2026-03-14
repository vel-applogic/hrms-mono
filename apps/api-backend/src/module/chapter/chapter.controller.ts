import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  ChapterCreateRequestType,
  ChapterDetailResponseType,
  ChapterListResponseType,
  ChapterUpdateRequestType,
  FilterRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { ChapterCreateRequestSchema, ChapterUpdateRequestSchema, FilterRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { ChapterCreateUc } from './uc/chapter-create.uc.js';
import { ChapterDeleteUc } from './uc/chapter-delete.uc.js';
import { ChapterGetUc } from './uc/chapter-get.uc.js';
import { ChapterSearchUc } from './uc/chapter-search.uc.js';
import { ChapterUpdateUc } from './uc/chapter-update.uc.js';

@Controller('api/chapter')
export class ChapterController {
  constructor(
    private readonly searchUc: ChapterSearchUc,
    private readonly getUc: ChapterGetUc,
    private readonly createUc: ChapterCreateUc,
    private readonly updateUc: ChapterUpdateUc,
    private readonly deleteUc: ChapterDeleteUc,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(ChapterCreateRequestSchema)) body: ChapterCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(ChapterUpdateRequestSchema)) body: ChapterUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch('/search')
  public async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(FilterRequestSchema)) filterDto: FilterRequestType,
  ): Promise<PaginatedResponseType<ChapterListResponseType>> {
    return await this.searchUc.execute({ currentUser, filterDto: filterDto });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<ChapterDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
