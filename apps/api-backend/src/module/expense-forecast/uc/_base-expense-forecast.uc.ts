import { Injectable } from '@nestjs/common';
import type { ExpenseForecastResponseType } from '@repo/dto';
import {
  BaseUc,
  CommonLoggerService,
  ExpenseForecastDao,
  ExpenseForecastSelectTableRecordType,
  expenseForecastFrequencyDbEnumToDtoEnum,
  expenseTypeDbEnumToDtoEnum,
  PrismaService,
} from '@repo/nest-lib';

@Injectable()
export class BaseExpenseForecastUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly expenseForecastDao: ExpenseForecastDao,
  ) {
    super(prisma, logger);
  }

  protected dbToExpenseForecastResponse(dbRec: ExpenseForecastSelectTableRecordType): ExpenseForecastResponseType {
    return {
      id: dbRec.id,
      description: dbRec.description ?? '',
      type: expenseTypeDbEnumToDtoEnum(dbRec.type),
      amount: dbRec.amount,
      frequency: expenseForecastFrequencyDbEnumToDtoEnum(dbRec.frequency),
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }
}
