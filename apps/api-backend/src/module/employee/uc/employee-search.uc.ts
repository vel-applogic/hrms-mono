import { Injectable } from '@nestjs/common';
import type { EmployeeFilterRequestType, EmployeeListResponseType, PaginatedResponseType } from '@repo/dto';
import { EmployeeSortableColumns } from '@repo/dto';
import type { EmployeeListRecordType, OrderByParam } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, PrismaService, UserEmployeeDetailDao, UserEmployeeHasMediaDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseEmployeeUc } from './_base-employee.uc.js';

type Params = {
  currentUser: import('@repo/nest-lib').CurrentUserType;
  filterDto: EmployeeFilterRequestType;
};

@Injectable()
export class EmployeeSearchUc extends BaseEmployeeUc implements IUseCase<Params, PaginatedResponseType<EmployeeListResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userEmployeeDetailDao: UserEmployeeDetailDao,
    userEmployeeHasMediaDao: UserEmployeeHasMediaDao,
    s3Service: S3Service,
  ) {
    super(prisma, logger, userEmployeeDetailDao, userEmployeeHasMediaDao, s3Service);
  }

  async execute(params: Params): Promise<PaginatedResponseType<EmployeeListResponseType>> {
    this.logger.i('Listing employees', { filter: params.filterDto });

    const orderBy = this.getEmployeeOrderBy(params.filterDto.sort);
    const { dbRecords, totalRecords } = await this.userEmployeeDetailDao.search({
      filterDto: params.filterDto,
      orderBy,
    });

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results: dbRecords.map((r: EmployeeListRecordType) => this.dbToEmployeeListResponse(r)),
    };
  }

  private getEmployeeOrderBy(sort?: { field: string; direction: 'asc' | 'desc' }): OrderByParam | undefined {
    if (!sort || !EmployeeSortableColumns.includes(sort.field as (typeof EmployeeSortableColumns)[number])) {
      return { createdAt: 'desc' };
    }
    if (['firstname', 'lastname', 'email'].includes(sort.field)) {
      return { user: { [sort.field]: sort.direction } } as unknown as OrderByParam;
    }
    return { [sort.field]: sort.direction };
  }
}
