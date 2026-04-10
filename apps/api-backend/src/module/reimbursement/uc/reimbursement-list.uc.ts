import { Injectable } from '@nestjs/common';
import type { PaginatedResponseType, ReimbursementFilterRequestType, ReimbursementResponseType } from '@repo/dto';
import { UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, ReimbursementDao, ReimbursementHasFeedbackDao, ReimbursementHasMediaDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseReimbursementUseCase } from './_base-reimbursement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: ReimbursementFilterRequestType;
};

@Injectable()
export class ReimbursementListUc extends BaseReimbursementUseCase implements IUseCase<Params, PaginatedResponseType<ReimbursementResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    reimbursementDao: ReimbursementDao,
    reimbursementHasMediaDao: ReimbursementHasMediaDao,
    reimbursementHasFeedbackDao: ReimbursementHasFeedbackDao,
    s3Service: S3Service,
  ) {
    super(prisma, logger, reimbursementDao, reimbursementHasMediaDao, reimbursementHasFeedbackDao, s3Service);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<ReimbursementResponseType>> {
    this.logger.i('Listing reimbursements');

    const isAdmin = params.currentUser.isSuperAdmin || params.currentUser.roles.includes(UserRoleDtoEnum.admin);

    const { dbRecords, totalRecords } = await this.reimbursementDao.search({
      organizationId: params.currentUser.organizationId,
      userId: isAdmin ? undefined : params.currentUser.id,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      search: params.filterDto.search,
      filterDto: params.filterDto,
    });

    const results = dbRecords.map((dbRec) => this.dbToReimbursementResponse(dbRec));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
