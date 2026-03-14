import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  OperationStatusResponseType,
  PaginatedResponseType,
  TopicCreateRequestType,
  TopicDetailResponseType,
  TopicFilterRequestType,
  TopicListResponseType,
  TopicUpdateRequestType,
} from '@repo/dto';
import { TopicCreateRequestSchema, TopicFilterRequestSchema, TopicUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { TopicCreateUc } from './uc/topic-create.uc.js';
import { TopicDeleteUc } from './uc/topic-delete.uc.js';
import { TopicGetUc } from './uc/topic-get.uc.js';
import { TopicSearchUc } from './uc/topic-search.uc.js';
import { TopicUpdateUc } from './uc/topic-update.uc.js';

@Controller('api/topic')
export class TopicController {
  constructor(
    private readonly searchUc: TopicSearchUc,
    private readonly getUc: TopicGetUc,
    private readonly createUc: TopicCreateUc,
    private readonly updateUc: TopicUpdateUc,
    private readonly deleteUc: TopicDeleteUc,
  ) {}

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<TopicDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(TopicCreateRequestSchema)) body: TopicCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(TopicUpdateRequestSchema)) body: TopicUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch('/search')
  public async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(TopicFilterRequestSchema)) filterDto: TopicFilterRequestType,
  ): Promise<PaginatedResponseType<TopicListResponseType>> {
    return await this.searchUc.execute({ currentUser, filterDto: filterDto });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
