import { Injectable } from '@nestjs/common';
import type { AdminUserListResponseType, PaginatedResponseType, UserFilterRequestType } from '@repo/dto';
import { AdminUsersSortableColumns, UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, OrganizationHasUserDao, PrismaService, UserDao, userRoleDbEnumToDtoEnum } from '@repo/nest-lib';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  filterDto: UserFilterRequestType;
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserSearchUc extends BaseAdminUserUc implements IUseCase<Params, PaginatedResponseType<AdminUserListResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, userDao: UserDao, organizationHasUserDao: OrganizationHasUserDao) {
    super(prisma, logger, userDao, organizationHasUserDao);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<AdminUserListResponseType>> {
    this.logger.i('Search admin users', { filter: params.filterDto });
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async search(params: Params): Promise<PaginatedResponseType<AdminUserListResponseType>> {
    const organizationId = params.currentUser.organizationId;
    const orderBy = this.getSort(params.filterDto.sort, AdminUsersSortableColumns);

    const filterDto: UserFilterRequestType = {
      ...params.filterDto,
      role: UserRoleDtoEnum.admin,
    };

    const { dbRecords, totalRecords } = await this.userDao.search({
      filterDto,
      orderBy,
      organizationId,
    });

    const orgRoles = this.organizationHasUserDao
      ? await this.organizationHasUserDao.findManyByUsersAndOrg({
          userIds: dbRecords.map((u) => u.id),
          organizationId,
        })
      : [];

    const orgRolesMap = new Map(orgRoles.map((o) => [o.userId, o.roles.map((r) => userRoleDbEnumToDtoEnum(r))]));

    const results: AdminUserListResponseType[] = dbRecords.map((u) => this.dbToAdminUserDetailResponse(u, orgRolesMap.get(u.id) ?? []));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
