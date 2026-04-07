import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import type { OperationStatusResponseType } from '@repo/dto';
import { CandidateHasFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class CandidateFeedbackDeleteUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly candidateHasFeedbackDao: CandidateHasFeedbackDao,
  ) {}

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting candidate feedback', { id: params.id });
    await this.validate(params);

    await this.prisma.$transaction(async (tx) => {
      await this.deleteFeedback(params, tx);
    });

    return { success: true };
  }

  private async validate(params: Params): Promise<void> {
    const existing = await this.candidateHasFeedbackDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Feedback not found', 404);
    }
  }

  private async deleteFeedback(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.candidateHasFeedbackDao.delete({ id: params.id, tx });
  }
}
