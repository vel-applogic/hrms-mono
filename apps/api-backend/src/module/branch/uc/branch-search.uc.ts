import { Injectable } from '@nestjs/common';
import type { BranchFilterRequestType, BranchResponseType, PaginatedResponseType } from '@repo/dto';
import { BranchSortableColumns } from '@repo/dto';
import { BranchDao, CommonLoggerService, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';

import { BaseBranchUseCase } from './_base-branch.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: BranchFilterRequestType;
};

@Injectable()
export class BranchSearchUc extends BaseBranchUseCase implements IUseCase<Params, PaginatedResponseType<BranchResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    branchDao: BranchDao,
  ) {
    super(prisma, logger, branchDao);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<BranchResponseType>> {
    this.assertAdmin(params.currentUser);

    const orderBy = this.getSort(params.dto.sort, BranchSortableColumns);

    const { totalRecords, dbRecords } = await this.branchDao.search({
      filterDto: params.dto,
      organizationId: params.currentUser.organizationId,
      orderBy,
    });

    const results = dbRecords.map((dbRec) => this.dbToBranchResponse(dbRec));

    return {
      page: params.dto.pagination.page,
      limit: params.dto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
