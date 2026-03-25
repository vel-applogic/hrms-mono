import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
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

import { AdminUserBlockUc } from './uc/admin-user-block.uc.js';
import { AdminUserCreateUc } from './uc/admin-user-create.uc.js';
import { AdminUserDeleteUc } from './uc/admin-user-delete.uc.js';
import { AdminUserGetUc } from './uc/admin-user-get.uc.js';
import { AdminUserGetStatsUc } from './uc/admin-user-get-stats.uc.js';
import { AdminUserSearchUc } from './uc/admin-user-search.uc.js';
import { AdminUserSearchPublicUsersUc } from './uc/admin-user-search-public-users.uc.js';
import { AdminUserUnblockUc } from './uc/admin-user-unblock.uc.js';
import { AdminUserUpdateUc } from './uc/admin-user-update.uc.js';

@Controller('api/admin/user')
export class AdminUserController {
  constructor(
    private readonly searchUc: AdminUserSearchUc,
    private readonly searchPublicUsersUc: AdminUserSearchPublicUsersUc,
    private readonly getUc: AdminUserGetUc,
    private readonly getStatsUc: AdminUserGetStatsUc,
    private readonly createUc: AdminUserCreateUc,
    private readonly updateUc: AdminUserUpdateUc,
    private readonly deleteUc: AdminUserDeleteUc,
    private readonly blockUc: AdminUserBlockUc,
    private readonly unblockUc: AdminUserUnblockUc,
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

  // @Patch('/search')
  // public async search(
  //   @CurrentUser() currentUser: CurrentUserType,
  //   @Body(new ZodValidationPipe(UserFilterRequestSchema)) filterDto: UserFilterRequestType,
  // ): Promise<PaginatedResponseType<AdminUserListResponseType>> {
  //   return await this.searchUc.execute({ currentUser, filterDto: filterDto });
  // }

  @Patch('/search-public-user')
  public async searchPublicUsers(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(UserFilterRequestSchema)) filterDto: UserFilterRequestType,
  ): Promise<PaginatedResponseType<AdminUserListResponseType>> {
    return await this.searchPublicUsersUc.execute({ currentUser, filterDto: filterDto });
  }

  @Get('get-public-user-stats')
  async getStats(@CurrentUser() currentUser: CurrentUserType): Promise<AdminUserStatsResponseType> {
    return this.getStatsUc.execute({ currentUser });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<AdminUserDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  // @Delete(':id')
  // async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
  //   return this.deleteUc.execute({ currentUser, id });
  // }

  @Put('/block/:id')
  async block(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.blockUc.execute({ currentUser, id });
  }

  @Put('/unblock/:id')
  async unblock(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.unblockUc.execute({ currentUser, id });
  }
}
