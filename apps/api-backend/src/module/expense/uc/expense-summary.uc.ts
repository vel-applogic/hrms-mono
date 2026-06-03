import { Injectable } from '@nestjs/common';
import type { ExpenseSummaryResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, ExpenseDao, IUseCase, OrganisationSettingDao, PrismaService } from '@repo/nest-lib';
import { getFinancialYearCode, getFinancialYearDateRange } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class ExpenseSummaryUc extends BaseUc implements IUseCase<Params, ExpenseSummaryResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly expenseDao: ExpenseDao,
    private readonly organisationSettingDao: OrganisationSettingDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<ExpenseSummaryResponseType> {
    this.logger.i('Getting expense summary');
    this.assertAdmin(params.currentUser);

    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const financialYearStartMonth = await this.organisationSettingDao.getFinancialYearStartMonth({ organisationId: params.currentUser.organisationId });
    const { start: financialYearStart, end: financialYearEnd } = getFinancialYearDateRange(getFinancialYearCode(now, financialYearStartMonth), financialYearStartMonth);

    return await this.expenseDao.getSummary({
      organisationId: params.currentUser.organisationId,
      thisMonthStart,
      thisMonthEnd,
      financialYearStart,
      financialYearEnd,
    });
  }
}
