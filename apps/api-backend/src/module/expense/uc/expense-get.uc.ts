import { Injectable } from '@nestjs/common';
import type { ExpenseResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, ExpenseDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseExpenseUseCase } from './_base-expense.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class ExpenseGetUc extends BaseExpenseUseCase implements IUseCase<Params, ExpenseResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, expenseDao: ExpenseDao) {
    super(prisma, logger, expenseDao);
  }

  public async execute(params: Params): Promise<ExpenseResponseType> {
    this.logger.i('Getting expense', { id: params.id });
    this.assertAdmin(params.currentUser);
    return await this.getExpenseResponseById(params.id, params.currentUser.organizationId);
  }
}
