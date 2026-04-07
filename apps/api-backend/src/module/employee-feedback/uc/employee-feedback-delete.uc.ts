import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { BaseUc, EmployeeFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeFeedbackDeleteUc extends BaseUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly employeeFeedbackDao: EmployeeFeedbackDao,
  ) {
    super(prisma, logger);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.assertAdmin(params.currentUser);
    this.logger.i('Deleting employee feedback', { id: params.id });

    const existing = await this.employeeFeedbackDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Feedback not found', 404);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.employeeFeedbackDao.deleteByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId, tx });
    });

    return { success: true };
  }
}
