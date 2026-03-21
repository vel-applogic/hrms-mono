import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, UserEmployeeDeductionDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeDeductionDeleteUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeDeductionDao: UserEmployeeDeductionDao,
  ) {}

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting employee deduction', { id: params.id });

    const existing = await this.userEmployeeDeductionDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Deduction not found', 404);
    }

    await this.userEmployeeDeductionDao.deleteById({ id: params.id });

    return { success: true };
  }
}
