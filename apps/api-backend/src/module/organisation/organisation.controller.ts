import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  CountryResponseType,
  CurrencyResponseType,
  OrganisationCreateRequestType,
  OrganisationDetailResponseType,
  OrganisationFilterRequestType,
  OrganisationResponseType,
  OrganisationSettingResponseType,
  OrganisationUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  OrganisationCreateRequestSchema,
  OrganisationFilterRequestSchema,
  OrganisationUpdateRequestSchema,
} from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { CountryListUc } from './uc/country-list.uc.js';
import { CurrencyListUc } from './uc/currency-list.uc.js';
import { OrganisationCreateUc } from './uc/organisation-create.uc.js';
import { OrganisationDeleteUc } from './uc/organisation-delete.uc.js';
import { OrganisationGetUc } from './uc/organisation-get.uc.js';
import { OrganisationSearchUc } from './uc/organisation-search.uc.js';
import { OrganisationSettingGetUc } from './uc/organisation-setting-get.uc.js';
import { OrganisationUpdateUc } from './uc/organisation-update.uc.js';

@Controller('api/organisation')
export class OrganisationController {
  constructor(
    private readonly currencyListUc: CurrencyListUc,
    private readonly countryListUc: CountryListUc,
    private readonly searchUc: OrganisationSearchUc,
    private readonly getUc: OrganisationGetUc,
    private readonly settingGetUc: OrganisationSettingGetUc,
    private readonly createUc: OrganisationCreateUc,
    private readonly updateUc: OrganisationUpdateUc,
    private readonly deleteUc: OrganisationDeleteUc,
  ) {}

  @Get('/currency')
  async listCurrencies(): Promise<CurrencyResponseType[]> {
    return this.currencyListUc.execute();
  }

  @Get('/country')
  async listCountries(): Promise<CountryResponseType[]> {
    return this.countryListUc.execute();
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(OrganisationCreateRequestSchema)) body: OrganisationCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OrganisationResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(OrganisationUpdateRequestSchema)) body: OrganisationUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OrganisationResponseType> {
    return this.updateUc.execute({ currentUser, dto: { ...body, id } });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(OrganisationFilterRequestSchema)) filterDto: OrganisationFilterRequestType,
  ): Promise<PaginatedResponseType<OrganisationResponseType>> {
    return this.searchUc.execute({ currentUser, filterDto });
  }

  @Get('/setting')
  async getSetting(@CurrentUser() currentUser: CurrentUserType): Promise<OrganisationSettingResponseType | null> {
    return this.settingGetUc.execute({ currentUser });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OrganisationDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
