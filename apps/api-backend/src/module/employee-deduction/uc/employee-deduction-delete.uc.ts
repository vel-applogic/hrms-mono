import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PayrollDeductionDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeDeductionDeleteUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payrollDeductionDao: PayrollDeductionDao,
  ) {}

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting employee deduction', { id: params.id });

    const existing = await this.payrollDeductionDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Deduction not found', 404);
    }

    await this.payrollDeductionDao.deleteById({ id: params.id });

    return { success: true };
  }
}
