import { Injectable } from '@nestjs/common';
import type { CandidateUpdateProgressRequestType, OperationStatusResponseType } from '@repo/dto';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
} from '@repo/dto';
import { AuditService, CandidateDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseCandidateUc } from './_base-candidate.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: CandidateUpdateProgressRequestType;
};

@Injectable()
export class CandidateUpdateProgressUc extends BaseCandidateUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    candidateDao: CandidateDao,
    s3Service: S3Service,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, candidateDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating candidate progress', { id: params.id, progress: params.dto.progress });

    const existing = await this.getByIdOrThrow(params.id, params.currentUser.organizationId);

    await this.transaction(async (tx) => {
      await this.candidateDao.update({
        id: params.id,
        organizationId: params.currentUser.organizationId,
        data: { progress: params.dto.progress },
        tx,
      });
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Candidate progress updated',
      data: {
        changes: {
          progress: {
            old: { type: 'string' as const, value: existing.progress },
            new: { type: 'string' as const, value: params.dto.progress },
          },
        },
      },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.candidate, entityId: params.id }],
    });

    return { success: true };
  }
}
