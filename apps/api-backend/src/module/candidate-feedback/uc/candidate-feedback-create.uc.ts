import { Injectable } from '@nestjs/common';
import type { CandidateFeedbackCreateRequestType, CandidateFeedbackResponseType, OperationStatusResponseType } from '@repo/dto';
import { CandidateDao, CandidateHasFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  dto: CandidateFeedbackCreateRequestType;
};

@Injectable()
export class CandidateFeedbackCreateUc implements IUseCase<Params, CandidateFeedbackResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly candidateDao: CandidateDao,
    private readonly candidateHasFeedbackDao: CandidateHasFeedbackDao,
  ) {}

  async execute(params: Params): Promise<CandidateFeedbackResponseType> {
    this.logger.i('Creating candidate feedback', { candidateId: params.dto.candidateId });

    const candidate = await this.candidateDao.getById({ id: params.dto.candidateId, organizationId: params.currentUser.organizationId });
    if (!candidate) {
      throw new ApiError('Candidate not found', 404);
    }

    const created = await this.candidateHasFeedbackDao.create({
      data: {
        candidate: { connect: { id: params.dto.candidateId } },
        createdBy: { connect: { id: params.currentUser.id } },
        feedback: params.dto.feedback,
      },
    });

    const withUser = await this.candidateHasFeedbackDao.getById({ id: created.id });
    if (!withUser) throw new ApiError('Failed to fetch created feedback', 500);

    return {
      id: withUser.id,
      candidateId: withUser.candidateId,
      feedback: withUser.feedback,
      createdAt: withUser.createdAt.toISOString(),
      updatedAt: withUser.updatedAt.toISOString(),
      givenBy: {
        id: withUser.createdBy.id,
        firstname: withUser.createdBy.firstname,
        lastname: withUser.createdBy.lastname,
        email: withUser.createdBy.email,
      },
    };
  }
}
