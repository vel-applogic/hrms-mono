import { Injectable } from '@nestjs/common';
import type { ExpenseFilterRequestType, ExpenseResponseType, PaginatedResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, ExpenseDao, IUseCase, OrganisationSettingDao, PrismaService } from '@repo/nest-lib';
import { getFinancialYearDateRange } from '@repo/shared';

import { BaseExpenseUseCase } from './_base-expense.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: ExpenseFilterRequestType;
};

@Injectable()
export class ExpenseListUc extends BaseExpenseUseCase implements IUseCase<Params, PaginatedResponseType<ExpenseResponseType>> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    expenseDao: ExpenseDao,
    private readonly organisationSettingDao: OrganisationSettingDao,
  ) {
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
    const dateRanges = await this.buildDateRanges(params);
    const { dbRecords, totalRecords } = await this.expenseDao.search({
      organisationId: params.currentUser.organisationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      search: params.filterDto.search,
      filterDto: params.filterDto,
      dateRanges,
    });

    const results = dbRecords.map((dbRec) => this.dbToExpenseResponse(dbRec));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }

  // Resolve the financial-year (and optional month) filter into concrete date ranges for the DAO.
  private async buildDateRanges(params: Params): Promise<Array<{ start: Date; end: Date }> | undefined> {
    if (!params.filterDto.financialYear) {
      return undefined;
    }

    const startMonth = await this.organisationSettingDao.getFinancialYearStartMonth({ organisationId: params.currentUser.organisationId });
    const { start, end } = getFinancialYearDateRange(params.filterDto.financialYear, startMonth);

    if (!params.filterDto.months || params.filterDto.months.length === 0) {
      return [{ start, end }];
    }

    const fyStartYear = start.getFullYear();
    const fyEndYear = end.getFullYear();
    // Months on/after the FY start month fall in the FY's start year; earlier months in the end year.
    return params.filterDto.months.map((m) => {
      const year = m >= startMonth ? fyStartYear : fyEndYear;
      return { start: new Date(year, m - 1, 1), end: new Date(year, m, 0, 23, 59, 59, 999) };
    });
  }
}
