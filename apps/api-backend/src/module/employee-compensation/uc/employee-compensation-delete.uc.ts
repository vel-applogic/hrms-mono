import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OperationStatusResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, IUseCase, PayrollCompensationDao, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeCompensationDeleteUc extends BaseUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly payrollCompensationDao: PayrollCompensationDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting employee compensation', { id: params.id });
    await this.validate(params);
    await this.prisma.$transaction(async (tx) => {
      await this.delete(params, tx);
    });
    return { success: true };
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);
    const existing = await this.payrollCompensationDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Compensation not found', 404);
    }
  }

  private async delete(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.payrollCompensationDao.deleteByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId, tx });
  }
}
