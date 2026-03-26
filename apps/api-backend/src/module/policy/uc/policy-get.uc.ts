import { Injectable } from '@nestjs/common';
import type { PolicyDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PolicyDao, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BasePolicyUc } from './_base-policy.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class PolicyGetUc extends BasePolicyUc implements IUseCase<Params, PolicyDetailResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, policyDao: PolicyDao, s3Service: S3Service) {
    super(prisma, logger, policyDao, s3Service);
  }

  async execute(params: Params): Promise<PolicyDetailResponseType> {
    this.logger.i('Getting policy', { id: params.id });

    const policy = await this.validate(params);

    return policy;
  }

  async validate(params: Params): Promise<PolicyDetailResponseType> {
    const policy = await this.getById(params.id, params.currentUser.organizationId);
    if (!policy) {
      throw new ApiError('Policy not found', 404);
    }
    return policy;
  }
}
