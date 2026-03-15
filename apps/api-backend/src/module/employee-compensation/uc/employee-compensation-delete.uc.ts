import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, UserEmployeeCompensationDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeCompensationDeleteUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeCompensationDao: UserEmployeeCompensationDao,
  ) {}

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting employee compensation', { id: params.id });

    const existing = await this.userEmployeeCompensationDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Compensation not found', 404);
    }

    await this.userEmployeeCompensationDao.deleteById({ id: params.id });

    return { success: true };
  }
}
