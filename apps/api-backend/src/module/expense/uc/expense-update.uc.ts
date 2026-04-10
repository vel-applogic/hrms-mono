import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { ExpenseResponseType, ExpenseUpdateRequestType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, ExpenseDao, expenseTypeDtoEnumToDbEnum, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { BaseExpenseUseCase } from './_base-expense.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: ExpenseUpdateRequestType;
};

@Injectable()
export class ExpenseUpdateUc extends BaseExpenseUseCase implements IUseCase<Params, ExpenseResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, expenseDao: ExpenseDao) {
    super(prisma, logger, expenseDao);
  }

  public async execute(params: Params): Promise<ExpenseResponseType> {
    this.logger.i('Updating expense', { id: params.id });
    await this.validate(params);

    await this.prisma.$transaction(async (tx) => {
      await this.update(params, tx);
    });

    return await this.getExpenseResponseById(params.id, params.currentUser.organizationId);
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);
    try {
      await this.expenseDao.getByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId });
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Expense not found');
      }
      throw error;
    }
  }

  private async update(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.expenseDao.update({
      id: params.id,
      data: {
        date: new Date(params.dto.date),
        description: params.dto.description,
        type: expenseTypeDtoEnumToDbEnum(params.dto.type),
        amount: params.dto.amount,
      },
      tx,
    });
  }
}
