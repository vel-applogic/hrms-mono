import { Injectable } from '@nestjs/common';
import type { ExpenseSummaryResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, ExpenseDao, IUseCase, PrismaService } from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class ExpenseSummaryUc extends BaseUc implements IUseCase<Params, ExpenseSummaryResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly expenseDao: ExpenseDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<ExpenseSummaryResponseType> {
    this.logger.i('Getting expense summary');
    this.assertAdmin(params.currentUser);

    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Financial year: April to March
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const financialYearStart = new Date(fyStartYear, 3, 1);
    const financialYearEnd = new Date(fyStartYear + 1, 2, 31);

    return await this.expenseDao.getSummary({
      organizationId: params.currentUser.organizationId,
      thisMonthStart,
      thisMonthEnd,
      financialYearStart,
      financialYearEnd,
    });
  }
}
