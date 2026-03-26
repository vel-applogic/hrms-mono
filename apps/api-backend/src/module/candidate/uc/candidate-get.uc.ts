import { Injectable } from '@nestjs/common';
import type { CandidateDetailResponseType } from '@repo/dto';
import { CandidateDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseCandidateUc } from './_base-candidate.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class CandidateGetUc extends BaseCandidateUc implements IUseCase<Params, CandidateDetailResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, candidateDao: CandidateDao, s3Service: S3Service) {
    super(prisma, logger, candidateDao, s3Service);
  }

  async execute(params: Params): Promise<CandidateDetailResponseType> {
    this.logger.i('Getting candidate', { id: params.id });

    const candidate = await this.validate(params);

    if (!candidate) throw new ApiBadRequestError('Candidate not found');
    return candidate;
  }

  private async validate(params: Params): Promise<CandidateDetailResponseType> {
    return await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
  }
}
