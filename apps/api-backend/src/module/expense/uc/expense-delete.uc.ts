import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OperationStatusResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, ExpenseDao, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class ExpenseDeleteUc extends BaseUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly expenseDao: ExpenseDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting expense', { id: params.id });
    await this.validate(params);

    await this.prisma.$transaction(async (tx) => {
      await this.delete(params, tx);
    });

    return { success: true };
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

  private async delete(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.expenseDao.deleteByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId, tx });
  }
}
