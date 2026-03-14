import { Injectable } from '@nestjs/common';
import type { CandidateUpdateStatusRequestType, OperationStatusResponseType } from '@repo/dto';
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
  dto: CandidateUpdateStatusRequestType;
};

@Injectable()
export class CandidateUpdateStatusUc extends BaseCandidateUc implements IUseCase<Params, OperationStatusResponseType> {
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
    this.logger.i('Updating candidate status', { id: params.id, status: params.dto.status });

    const existing = await this.getByIdOrThrow(params.id);

    await this.candidateDao.update({
      id: params.id,
      data: { status: params.dto.status },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Candidate status updated',
      data: {
        changes: {
          status: {
            old: { type: 'string' as const, value: existing.status },
            new: { type: 'string' as const, value: params.dto.status },
          },
        },
      },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.candidate, entityId: params.id }],
    });

    return { success: true };
  }
}
