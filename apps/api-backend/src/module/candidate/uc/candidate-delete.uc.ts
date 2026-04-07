import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  CandidateDetailResponseType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AuditService, CandidateDao, CandidateHasMediaDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseCandidateUc } from './_base-candidate.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class CandidateDeleteUc extends BaseCandidateUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    candidateDao: CandidateDao,
    s3Service: S3Service,
    private readonly candidateHasMediaDao: CandidateHasMediaDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, candidateDao, s3Service);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting candidate', { id: params.id });
    const candidate = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.deleteMedia(params, tx);
      await this.deleteCandidate(params, tx);
    });

    void this.recordActivity(params, candidate);
    return { success: true, message: 'Candidate deleted successfully' };
  }

  private async validate(params: Params): Promise<CandidateDetailResponseType> {
    return await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
  }

  private async deleteMedia(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.candidateHasMediaDao.deleteManyByCandidateId({ candidateId: params.id, tx });
  }

  private async deleteCandidate(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.candidateDao.deleteByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId, tx });
  }

  private async recordActivity(params: Params, deleted: CandidateDetailResponseType): Promise<void> {
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Candidate ${deleted.firstname} ${deleted.lastname} deleted`,
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.candidate, entityId: deleted.id }],
    });
  }
}
