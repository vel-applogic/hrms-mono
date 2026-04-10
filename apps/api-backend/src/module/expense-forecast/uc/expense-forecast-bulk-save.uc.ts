import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { ExpenseForecastBulkSaveRequestType, ExpenseForecastResponseType } from '@repo/dto';
import {
  CommonLoggerService,
  CurrentUserType,
  ExpenseForecastDao,
  expenseForecastFrequencyDtoEnumToDbEnum,
  expenseTypeDtoEnumToDbEnum,
  IUseCase,
  PrismaService,
} from '@repo/nest-lib';

import { BaseExpenseForecastUseCase } from './_base-expense-forecast.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: ExpenseForecastBulkSaveRequestType;
};

@Injectable()
export class ExpenseForecastBulkSaveUc extends BaseExpenseForecastUseCase implements IUseCase<Params, ExpenseForecastResponseType[]> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, expenseForecastDao: ExpenseForecastDao) {
    super(prisma, logger, expenseForecastDao);
  }

  public async execute(params: Params): Promise<ExpenseForecastResponseType[]> {
    this.logger.i('Bulk saving expense forecasts', { count: params.dto.items.length });
    this.assertAdmin(params.currentUser);

    await this.prisma.$transaction(async (tx) => {
      await this.bulkSave(params, tx);
    });

    const dbRecords = await this.expenseForecastDao.findAllByOrganizationId({
      organizationId: params.currentUser.organizationId,
    });

    return dbRecords.map((dbRec) => this.dbToExpenseForecastResponse(dbRec));
  }

  private async bulkSave(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    const existingIds: number[] = [];

    for (const item of params.dto.items) {
      if (item.id) {
        existingIds.push(item.id);
        await this.expenseForecastDao.update({
          id: item.id,
          data: {
            description: item.description,
            type: expenseTypeDtoEnumToDbEnum(item.type),
            amount: item.amount,
            frequency: expenseForecastFrequencyDtoEnumToDbEnum(item.frequency),
          },
          tx,
        });
      } else {
        const createdId = await this.expenseForecastDao.create({
          data: {
            description: item.description,
            type: expenseTypeDtoEnumToDbEnum(item.type),
            amount: item.amount,
            frequency: expenseForecastFrequencyDtoEnumToDbEnum(item.frequency),
            organization: { connect: { id: params.currentUser.organizationId } },
          },
          tx,
        });
        existingIds.push(createdId);
      }
    }

    // Delete items not in the list
    await this.expenseForecastDao.deleteByOrganizationIdExcluding({
      organizationId: params.currentUser.organizationId,
      excludeIds: existingIds,
      tx,
    });
  }
}
