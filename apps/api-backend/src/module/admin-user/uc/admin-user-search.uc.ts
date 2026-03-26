import { Injectable } from '@nestjs/common';
import type { AdminUserListResponseType, PaginatedResponseType, UserFilterRequestType } from '@repo/dto';
import { AdminUsersSortableColumns, UserRoleDtoEnum } from '@repo/dto';
import type { OrderByParam } from '@repo/nest-lib';
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

  async execute(params: Params): Promise<PaginatedResponseType<AdminUserListResponseType>> {
    this.logger.i('Search admin users', { filter: params.filterDto });

    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      orderBy: this.getSort(params.filterDto.sort, AdminUsersSortableColumns),
      organizationId: params.currentUser.organizationId,
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  public async search(params: {
    filterDto: UserFilterRequestType;
    orderBy?: OrderByParam;
    organizationId: number;
  }): Promise<{ totalRecords: number; results: AdminUserListResponseType[] }> {
    const filterDto: UserFilterRequestType = {
      ...params.filterDto,
      role: UserRoleDtoEnum.admin,
    };

    const { dbRecords, totalRecords } = await this.userDao.search({
      filterDto,
      orderBy: params.orderBy,
      organizationId: params.organizationId,
    });

    const orgRoles = this.organizationHasUserDao
      ? await this.organizationHasUserDao.findManyByUsersAndOrg({
          userIds: dbRecords.map((u) => u.id),
          organizationId: params.organizationId,
        })
      : [];

    const orgRolesMap = new Map(orgRoles.map((o) => [o.userId, o.roles.map((r) => userRoleDbEnumToDtoEnum(r))]));

    const results: AdminUserListResponseType[] = dbRecords.map((u) => this.dbToAdminUserDetailResponse(u, orgRolesMap.get(u.id) ?? []));
    return { totalRecords, results };
  }
}
