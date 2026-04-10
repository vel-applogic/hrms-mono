import { Injectable } from '@nestjs/common';
import type { ExpenseForecastSummaryResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, ExpenseForecastDao, IUseCase, PrismaService } from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class ExpenseForecastSummaryUc extends BaseUc implements IUseCase<Params, ExpenseForecastSummaryResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly expenseForecastDao: ExpenseForecastDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<ExpenseForecastSummaryResponseType> {
    this.logger.i('Getting expense forecast summary');
    this.assertAdmin(params.currentUser);

    const dbRecords = await this.expenseForecastDao.findAllByOrganizationId({
      organizationId: params.currentUser.organizationId,
    });

    let monthlyTotal = 0;
    let yearlyTotal = 0;
    for (const record of dbRecords) {
      if (record.frequency === 'monthly') {
        monthlyTotal += record.amount;
        yearlyTotal += record.amount * 12;
      } else {
        monthlyTotal += record.amount / 12;
        yearlyTotal += record.amount;
      }
    }

    return { monthlyTotal: Math.round(monthlyTotal), yearlyTotal: Math.round(yearlyTotal) };
  }
}
