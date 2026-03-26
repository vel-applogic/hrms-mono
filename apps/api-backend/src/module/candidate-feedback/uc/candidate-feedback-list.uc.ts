import { Injectable } from '@nestjs/common';
import type { CandidateFeedbackFilterRequestType, CandidateFeedbackResponseType, PaginatedResponseType } from '@repo/dto';
import { CandidateDao, CandidateHasFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  filterDto: CandidateFeedbackFilterRequestType;
};

@Injectable()
export class CandidateFeedbackListUc implements IUseCase<Params, PaginatedResponseType<CandidateFeedbackResponseType>> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly candidateDao: CandidateDao,
    private readonly candidateHasFeedbackDao: CandidateHasFeedbackDao,
  ) {}

  async execute(params: Params): Promise<PaginatedResponseType<CandidateFeedbackResponseType>> {
    this.logger.i('Listing candidate feedbacks', { candidateId: params.filterDto.candidateId });

    const candidate = await this.candidateDao.getById({ id: params.filterDto.candidateId, organizationId: params.currentUser.organizationId });
    if (!candidate) {
      throw new ApiError('Candidate not found', 404);
    }

    const { feedbacks, totalRecords } = await this.candidateHasFeedbackDao.findByCandidateIdWithPagination({
      candidateId: params.filterDto.candidateId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
    });

    const results = feedbacks.map((f) => ({
      id: f.id,
      candidateId: f.candidateId,
      feedback: f.feedback,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
      givenBy: {
        id: f.createdBy.id,
        firstname: f.createdBy.firstname,
        lastname: f.createdBy.lastname,
        email: f.createdBy.email,
      },
    }));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
