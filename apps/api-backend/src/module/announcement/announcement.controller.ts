import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  AnnouncementCreateRequestType,
  AnnouncementDetailResponseType,
  AnnouncementFilterRequestType,
  AnnouncementResponseType,
  AnnouncementUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { AnnouncementCreateRequestSchema, AnnouncementFilterRequestSchema, AnnouncementUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { AnnouncementCreateUc } from './uc/announcement-create.uc.js';
import { AnnouncementDeleteUc } from './uc/announcement-delete.uc.js';
import { AnnouncementGetUc } from './uc/announcement-get.uc.js';
import { AnnouncementSearchUc } from './uc/announcement-search.uc.js';
import { AnnouncementUpdateUc } from './uc/announcement-update.uc.js';

@Controller('api/announcement')
export class AnnouncementController {
  constructor(
    private readonly searchUc: AnnouncementSearchUc,
    private readonly getUc: AnnouncementGetUc,
    private readonly createUc: AnnouncementCreateUc,
    private readonly updateUc: AnnouncementUpdateUc,
    private readonly deleteUc: AnnouncementDeleteUc,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(AnnouncementCreateRequestSchema)) body: AnnouncementCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<AnnouncementResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(AnnouncementFilterRequestSchema)) filterDto: AnnouncementFilterRequestType,
  ): Promise<PaginatedResponseType<AnnouncementResponseType>> {
    return this.searchUc.execute({ currentUser, filterDto });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AnnouncementUpdateRequestSchema)) body: AnnouncementUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<AnnouncementResponseType> {
    return this.updateUc.execute({ currentUser, dto: { ...body, id } });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<AnnouncementDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
