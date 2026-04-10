import { Injectable } from '@nestjs/common';
import type { ExpenseForecastResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, ExpenseForecastDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseExpenseForecastUseCase } from './_base-expense-forecast.uc.js';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class ExpenseForecastListUc extends BaseExpenseForecastUseCase implements IUseCase<Params, ExpenseForecastResponseType[]> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, expenseForecastDao: ExpenseForecastDao) {
    super(prisma, logger, expenseForecastDao);
  }

  public async execute(params: Params): Promise<ExpenseForecastResponseType[]> {
    this.logger.i('Listing expense forecasts');
    this.assertAdmin(params.currentUser);

    const dbRecords = await this.expenseForecastDao.findAllByOrganizationId({
      organizationId: params.currentUser.organizationId,
    });

    return dbRecords.map((dbRec) => this.dbToExpenseForecastResponse(dbRec));
  }
}
