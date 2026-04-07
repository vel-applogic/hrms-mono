import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import type { CandidateFeedbackCreateRequestType, CandidateFeedbackResponseType } from '@repo/dto';
import { CandidateDao, CandidateHasFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  dto: CandidateFeedbackCreateRequestType;
};

@Injectable()
export class CandidateFeedbackCreateUc implements IUseCase<Params, CandidateFeedbackResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly candidateDao: CandidateDao,
    private readonly candidateHasFeedbackDao: CandidateHasFeedbackDao,
  ) {}

  public async execute(params: Params): Promise<CandidateFeedbackResponseType> {
    this.logger.i('Creating candidate feedback', { candidateId: params.dto.candidateId });
    await this.validate(params);

    const createdId = await this.prisma.$transaction(async (tx) => {
      return await this.createFeedback(params, tx);
    });

    return await this.getResponseById(createdId);
  }

  private async validate(params: Params): Promise<void> {
    const candidate = await this.candidateDao.getById({ id: params.dto.candidateId, organizationId: params.currentUser.organizationId });
    if (!candidate) {
      throw new ApiError('Candidate not found', 404);
    }
  }

  private async createFeedback(params: Params, tx: Prisma.TransactionClient): Promise<number> {
    return await this.candidateHasFeedbackDao.create({
      data: {
        candidate: { connect: { id: params.dto.candidateId } },
        createdBy: { connect: { id: params.currentUser.id } },
        feedback: params.dto.feedback,
      },
      tx,
    });
  }

  private async getResponseById(id: number): Promise<CandidateFeedbackResponseType> {
    const withUser = await this.candidateHasFeedbackDao.getById({ id });
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
