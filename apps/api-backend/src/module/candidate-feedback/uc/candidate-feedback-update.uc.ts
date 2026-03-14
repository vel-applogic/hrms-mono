import { Injectable } from '@nestjs/common';
import type { CandidateFeedbackResponseType, CandidateFeedbackUpdateRequestType, OperationStatusResponseType } from '@repo/dto';
import { CandidateHasFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: CandidateFeedbackUpdateRequestType;
};

@Injectable()
export class CandidateFeedbackUpdateUc implements IUseCase<Params, CandidateFeedbackResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly candidateHasFeedbackDao: CandidateHasFeedbackDao,
  ) {}

  async execute(params: Params): Promise<CandidateFeedbackResponseType> {
    this.logger.i('Updating candidate feedback', { id: params.id });

    const existing = await this.candidateHasFeedbackDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Feedback not found', 404);
    }

    await this.candidateHasFeedbackDao.update({
      id: params.id,
      data: { feedback: params.dto.feedback },
    });

    const updated = await this.candidateHasFeedbackDao.getById({ id: params.id });
    if (!updated) throw new ApiError('Failed to fetch updated feedback', 500);

    return {
      id: updated.id,
      candidateId: updated.candidateId,
      feedback: updated.feedback,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      givenBy: {
        id: updated.createdBy.id,
        firstname: updated.createdBy.firstname,
        lastname: updated.createdBy.lastname,
        email: updated.createdBy.email,
      },
    };
  }
}
