import { Injectable } from '@nestjs/common';
import type { ExpenseFilterRequestType, ExpenseResponseType, PaginatedResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, ExpenseDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseExpenseUseCase } from './_base-expense.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: ExpenseFilterRequestType;
};

@Injectable()
export class ExpenseListUc extends BaseExpenseUseCase implements IUseCase<Params, PaginatedResponseType<ExpenseResponseType>> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, expenseDao: ExpenseDao) {
    super(prisma, logger, expenseDao);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<ExpenseResponseType>> {
    this.logger.i('Listing expenses');
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);
  }

  private async search(params: Params): Promise<PaginatedResponseType<ExpenseResponseType>> {
    const { dbRecords, totalRecords } = await this.expenseDao.search({
      organizationId: params.currentUser.organizationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      search: params.filterDto.search,
      filterDto: params.filterDto,
    });

    const results = dbRecords.map((dbRec) => this.dbToExpenseResponse(dbRec));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
