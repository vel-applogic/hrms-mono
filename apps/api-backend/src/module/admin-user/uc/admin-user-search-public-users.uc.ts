import { Injectable } from '@nestjs/common';
import type { AdminUserListResponseType, PaginatedResponseType, UserFilterRequestType } from '@repo/dto';
import { AdminUsersSortableColumns, UserRoleDtoEnum } from '@repo/dto';
import type { OrderByParam } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  filterDto: UserFilterRequestType;
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserSearchPublicUsersUc extends BaseAdminUserUc implements IUseCase<Params, PaginatedResponseType<AdminUserListResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, userDao: UserDao) {
    super(prisma, logger, userDao);
  }

  async execute(params: Params): Promise<PaginatedResponseType<AdminUserListResponseType>> {
    this.logger.i('Search users', { filter: params.filterDto });

    await this.validate(params);

    const { results, totalRecords } = await this.search({
      filterDto: params.filterDto,
      orderBy: this.getSort(params.filterDto.sort, AdminUsersSortableColumns),
    });
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  public async search(params: { filterDto: UserFilterRequestType; orderBy?: OrderByParam }): Promise<{ totalRecords: number; results: AdminUserListResponseType[] }> {
    const filterDto: UserFilterRequestType = {
      ...params.filterDto,
      role: UserRoleDtoEnum.admin,
    };
    const { dbRecords, totalRecords } = await this.userDao.search({
      filterDto,
      orderBy: params.orderBy,
    });
    const results: AdminUserListResponseType[] = dbRecords.map((p) => this.dbToAdminUserDetailResponse(p));
    return { totalRecords, results };
  }

  async validate(_params: Params): Promise<void> {}
}
