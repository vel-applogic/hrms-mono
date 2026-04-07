import { Injectable } from '@nestjs/common';
import type { CandidateDetailResponseType } from '@repo/dto';
import { CandidateDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';

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

  public async execute(params: Params): Promise<CandidateDetailResponseType> {
    this.logger.i('Getting candidate', { id: params.id });
    await this.validate(params);
    return await this.fetchCandidate(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async fetchCandidate(params: Params): Promise<CandidateDetailResponseType> {
    return await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
  }
}
