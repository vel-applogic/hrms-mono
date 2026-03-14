import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  OperationStatusResponseType,
  PaginatedResponseType,
  SlideCreateRequestType,
  SlideDetailResponseType,
  SlideFilterRequestType,
  SlideListResponseType,
  SlideUpdateRequestType,
} from '@repo/dto';
import { SlideCreateRequestSchema, SlideFilterRequestSchema, SlideUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { SlideCreateUc } from './uc/slide-create.uc.js';
import { SlideDeleteUc } from './uc/slide-delete.uc.js';
import { SlideGetUc } from './uc/slide-get.uc.js';
import { SlideSearchUc } from './uc/slide-search.uc.js';
import { SlideUpdateUc } from './uc/slide-update.uc.js';

@Controller('api/slide')
export class SlideController {
  constructor(
    private readonly searchUc: SlideSearchUc,
    private readonly getUc: SlideGetUc,
    private readonly createUc: SlideCreateUc,
    private readonly updateUc: SlideUpdateUc,
    private readonly deleteUc: SlideDeleteUc,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(SlideCreateRequestSchema)) body: SlideCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(SlideUpdateRequestSchema)) body: SlideUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch('/search')
  public async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(SlideFilterRequestSchema)) filterDto: SlideFilterRequestType,
  ): Promise<PaginatedResponseType<SlideListResponseType>> {
    return await this.searchUc.execute({ currentUser, filterDto: filterDto });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<SlideDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
