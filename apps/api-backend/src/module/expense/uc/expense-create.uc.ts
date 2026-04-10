import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { ExpenseCreateRequestType, ExpenseResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, ExpenseDao, expenseTypeDtoEnumToDbEnum, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseExpenseUseCase } from './_base-expense.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: ExpenseCreateRequestType;
};

@Injectable()
export class ExpenseCreateUc extends BaseExpenseUseCase implements IUseCase<Params, ExpenseResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, expenseDao: ExpenseDao) {
    super(prisma, logger, expenseDao);
  }

  public async execute(params: Params): Promise<ExpenseResponseType> {
    this.logger.i('Creating expense', { description: params.dto.description });
    await this.validate(params);

    const createdId = await this.prisma.$transaction(async (tx) => {
      return await this.create(params, tx);
    });

    return await this.getExpenseResponseById(createdId, params.currentUser.organizationId);
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);
  }

  private async create(params: Params, tx: Prisma.TransactionClient): Promise<number> {
    return await this.expenseDao.create({
      data: {
        date: new Date(params.dto.date),
        description: params.dto.description,
        type: expenseTypeDtoEnumToDbEnum(params.dto.type),
        amount: params.dto.amount,
        organization: { connect: { id: params.currentUser.organizationId } },
      },
      tx,
    });
  }
}
