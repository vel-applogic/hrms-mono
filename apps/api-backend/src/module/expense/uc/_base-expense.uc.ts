import { Injectable } from '@nestjs/common';
import type { ExpenseResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, ExpenseDao, ExpenseSelectTableRecordType, expenseTypeDbEnumToDtoEnum, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

@Injectable()
export class BaseExpenseUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly expenseDao: ExpenseDao,
  ) {
    super(prisma, logger);
  }

  protected dbToExpenseResponse(dbRec: ExpenseSelectTableRecordType): ExpenseResponseType {
    return {
      id: dbRec.id,
      date: dbRec.date.toISOString().split('T')[0]!,
      description: dbRec.description,
      type: expenseTypeDbEnumToDtoEnum(dbRec.type),
      amount: dbRec.amount,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async getExpenseResponseById(id: number, organizationId: number): Promise<ExpenseResponseType> {
    try {
      const dbRec = await this.expenseDao.getByIdOrThrow({ id, organizationId });
      return this.dbToExpenseResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Expense not found');
      }
      throw error;
    }
  }
}
