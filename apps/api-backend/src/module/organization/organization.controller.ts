import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  CurrencyResponseType,
  OrganizationCreateRequestType,
  OrganizationDetailResponseType,
  OrganizationFilterRequestType,
  OrganizationResponseType,
  OrganizationUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  OrganizationCreateRequestSchema,
  OrganizationFilterRequestSchema,
  OrganizationUpdateRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { CurrencyListUc } from './uc/currency-list.uc.js';
import { OrganizationCreateUc } from './uc/organization-create.uc.js';
import { OrganizationDeleteUc } from './uc/organization-delete.uc.js';
import { OrganizationGetUc } from './uc/organization-get.uc.js';
import { OrganizationSearchUc } from './uc/organization-search.uc.js';
import { OrganizationUpdateUc } from './uc/organization-update.uc.js';

@Controller('api/organization')
export class OrganizationController {
  constructor(
    private readonly currencyListUc: CurrencyListUc,
    private readonly searchUc: OrganizationSearchUc,
    private readonly getUc: OrganizationGetUc,
    private readonly createUc: OrganizationCreateUc,
    private readonly updateUc: OrganizationUpdateUc,
    private readonly deleteUc: OrganizationDeleteUc,
  ) {}

  @Get('/currency')
  async listCurrencies(): Promise<CurrencyResponseType[]> {
    return this.currencyListUc.execute();
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(OrganizationCreateRequestSchema)) body: OrganizationCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OrganizationResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(OrganizationUpdateRequestSchema)) body: OrganizationUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OrganizationResponseType> {
    return this.updateUc.execute({ currentUser, dto: { ...body, id } });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(OrganizationFilterRequestSchema)) filterDto: OrganizationFilterRequestType,
  ): Promise<PaginatedResponseType<OrganizationResponseType>> {
    return this.searchUc.execute({ currentUser, filterDto });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OrganizationDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
