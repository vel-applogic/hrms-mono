import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { UserEmployeeFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeFeedbackDeleteUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeFeedbackDao: UserEmployeeFeedbackDao,
  ) {}

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting employee feedback', { id: params.id });

    const existing = await this.userEmployeeFeedbackDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Feedback not found', 404);
    }

    await this.userEmployeeFeedbackDao.delete({ id: params.id });

    return { success: true };
  }
}
