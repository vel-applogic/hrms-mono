import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeBgvFeedbackDao, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeBgvFeedbackDeleteUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeBgvFeedbackDao: EmployeeBgvFeedbackDao,
  ) {}

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting employee BGV feedback', { id: params.id });
    await this.validate(params);
    return await this.delete(params);
  }

  private async validate(params: Params): Promise<void> {
    const existing = await this.employeeBgvFeedbackDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('BGV feedback not found', 404);
    }
  }

  private async delete(params: Params): Promise<OperationStatusResponseType> {
    await this.prisma.$transaction(async (tx) => {
      await this.employeeBgvFeedbackDao.deleteByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId, tx });
    });

    return { success: true };
  }
}
