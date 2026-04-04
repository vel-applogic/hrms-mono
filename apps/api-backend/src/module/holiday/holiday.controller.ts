import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  HolidayCreateRequestType,
  HolidayFilterRequestType,
  HolidayResponseType,
  HolidayUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { HolidayCreateRequestSchema, HolidayFilterRequestSchema, HolidayUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { AdminOnly, CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { HolidayCreateUc } from './uc/holiday-create.uc.js';
import { HolidayDeleteUc } from './uc/holiday-delete.uc.js';
import { HolidayListUc } from './uc/holiday-list.uc.js';
import { HolidayUpdateUc } from './uc/holiday-update.uc.js';
import { HolidayYearsUc } from './uc/holiday-years.uc.js';

@Controller('api/holiday')
export class HolidayController {
  constructor(
    private readonly listUc: HolidayListUc,
    private readonly yearsUc: HolidayYearsUc,
    private readonly createUc: HolidayCreateUc,
    private readonly updateUc: HolidayUpdateUc,
    private readonly deleteUc: HolidayDeleteUc,
  ) {}

  @Get('/years')
  async getYears(@CurrentUser() currentUser: CurrentUserType): Promise<number[]> {
    return this.yearsUc.execute({ currentUser });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(HolidayFilterRequestSchema)) filterDto: HolidayFilterRequestType,
  ): Promise<PaginatedResponseType<HolidayResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @AdminOnly()
  @Post()
  async create(
    @Body(new ZodValidationPipe(HolidayCreateRequestSchema)) body: HolidayCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<HolidayResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @AdminOnly()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(HolidayUpdateRequestSchema)) body: HolidayUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<HolidayResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @AdminOnly()
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
