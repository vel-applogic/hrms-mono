import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  AdminUserCreateRequestType,
  AdminUserDetailResponseType,
  AdminUserListResponseType,
  AdminUserStatsResponseType,
  AdminUserUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
  UserFilterRequestType,
} from '@repo/dto';
import { AdminUserCreateRequestSchema, AdminUserUpdateRequestSchema, UserFilterRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { AdminUserCreateUc } from './uc/admin-user-create.uc.js';
import { AdminUserGetUc } from './uc/admin-user-get.uc.js';
import { AdminUserGetStatsUc } from './uc/admin-user-get-stats.uc.js';
import { AdminUserSearchPublicUsersUc } from './uc/admin-user-search-public-users.uc.js';
import { AdminUserUpdateUc } from './uc/admin-user-update.uc.js';

@Controller('api/admin-user')
export class AdminUserController {
  constructor(
    private readonly searchUc: AdminUserSearchPublicUsersUc,
    private readonly getUc: AdminUserGetUc,
    private readonly getStatsUc: AdminUserGetStatsUc,
    private readonly createUc: AdminUserCreateUc,
    private readonly updateUc: AdminUserUpdateUc,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(AdminUserCreateRequestSchema)) body: AdminUserCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AdminUserUpdateRequestSchema)) body: AdminUserUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch('search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(UserFilterRequestSchema)) filterDto: UserFilterRequestType,
  ): Promise<PaginatedResponseType<AdminUserListResponseType>> {
    return this.searchUc.execute({ currentUser, filterDto });
  }

  @Get('stats')
  async getStats(@CurrentUser() currentUser: CurrentUserType): Promise<AdminUserStatsResponseType> {
    return this.getStatsUc.execute({ currentUser });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<AdminUserDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }
}
