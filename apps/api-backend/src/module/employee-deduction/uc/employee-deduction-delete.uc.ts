import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, IUseCase, PayrollDeductionDao, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeDeductionDeleteUc extends BaseUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly payrollDeductionDao: PayrollDeductionDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.assertAdmin(params.currentUser);
    this.logger.i('Deleting employee deduction', { id: params.id });
    await this.validate(params);
    return await this.delete(params);
  }

  private async validate(params: Params): Promise<void> {
    const existing = await this.payrollDeductionDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Deduction not found', 404);
    }
  }

  private async delete(params: Params): Promise<OperationStatusResponseType> {
    await this.prisma.$transaction(async (tx) => {
      await this.payrollDeductionDao.deleteByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId, tx });
    });

    return { success: true };
  }
}
