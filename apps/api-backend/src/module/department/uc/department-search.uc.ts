import { Injectable } from '@nestjs/common';
import type { DepartmentFilterRequestType, DepartmentResponseType, PaginatedResponseType } from '@repo/dto';
import { DepartmentSortableColumns } from '@repo/dto';
import { CommonLoggerService, DepartmentDao, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';

import { BaseDepartmentUseCase } from './_base-department.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: DepartmentFilterRequestType;
};

@Injectable()
export class DepartmentSearchUc extends BaseDepartmentUseCase implements IUseCase<Params, PaginatedResponseType<DepartmentResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    departmentDao: DepartmentDao,
  ) {
    super(prisma, logger, departmentDao);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<DepartmentResponseType>> {
    this.assertAdmin(params.currentUser);

    const orderBy = this.getSort(params.dto.sort, DepartmentSortableColumns);

    const { totalRecords, dbRecords } = await this.departmentDao.search({
      filterDto: params.dto,
      organizationId: params.currentUser.organizationId,
      orderBy,
    });

    const results = dbRecords.map((dbRec) => this.dbToDepartmentResponse(dbRec));

    return {
      page: params.dto.pagination.page,
      limit: params.dto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
