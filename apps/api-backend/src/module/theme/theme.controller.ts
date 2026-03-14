import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type { ThemeCreateRequestType, ThemeDetailResponseType, ThemeListResponseType, ThemeUpdateRequestType, FilterRequestType, OperationStatusResponseType, PaginatedResponseType } from '@repo/dto';
import { ThemeCreateRequestSchema, ThemeUpdateRequestSchema, FilterRequestSchema } from '@repo/dto';
import type { CurrentUserType, } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { ThemeCreateUc } from './uc/theme-create.uc.js';
import { ThemeDeleteUc } from './uc/theme-delete.uc.js';
import { ThemeGetUc } from './uc/theme-get.uc.js';
import { ThemeSearchUc } from './uc/theme-search.uc.js';
import { ThemeUpdateUc } from './uc/theme-update.uc.js';

@Controller('api/theme')
export class ThemeController {
  constructor(
    private readonly searchUc: ThemeSearchUc,
    private readonly getUc: ThemeGetUc,
    private readonly createUc: ThemeCreateUc,
    private readonly updateUc: ThemeUpdateUc,
    private readonly deleteUc: ThemeDeleteUc,
  ) {}

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType ): Promise<ThemeDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Post()
  async create(@Body(new ZodValidationPipe(ThemeCreateRequestSchema)) body: ThemeCreateRequestType, @CurrentUser() currentUser: CurrentUserType ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body(new ZodValidationPipe(ThemeUpdateRequestSchema)) body: ThemeUpdateRequestType, @CurrentUser() currentUser: CurrentUserType ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch('/search')
  public async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(FilterRequestSchema)) filterDto: FilterRequestType,
  ): Promise<PaginatedResponseType<ThemeListResponseType>> {
    return await this.searchUc.execute({ currentUser, filterDto: filterDto });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType ): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
