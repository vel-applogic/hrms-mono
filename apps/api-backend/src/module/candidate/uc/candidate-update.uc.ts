import { Injectable } from '@nestjs/common';
import { CandidateMediaType, Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  CandidateDetailResponseType,
  CandidateUpdateRequestType,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AuditService, CandidateDao, CandidateHasMediaDao, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseCandidateUc } from './_base-candidate.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: CandidateUpdateRequestType;
};

@Injectable()
export class CandidateUpdateUc extends BaseCandidateUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    candidateDao: CandidateDao,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly candidateHasMediaDao: CandidateHasMediaDao,
    private readonly mediaService: MediaService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, candidateDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating candidate', { id: params.id });

    const oldCandidate = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.candidateDao.update({
        id: params.id,
        data: {
          firstname: params.dto.firstname,
          lastname: params.dto.lastname,
          email: params.dto.email,
          contactNumbers: params.dto.contactNumbers ?? [],
          source: params.dto.source,
          urls: params.dto.urls ?? [],
          expInYears: params.dto.expInYears,
          relevantExpInYears: params.dto.relevantExpInYears,
          skills: params.dto.skills ?? [],
          currentCtcInLacs: params.dto.currentCtcInLacs,
          expectedCtcInLacs: params.dto.expectedCtcInLacs,
          noticePeriod: params.dto.noticePeriod,
          noticePeriodUnit: params.dto.noticePeriodUnit,
          status: params.dto.status,
          progress: params.dto.progress,
          updatedAt: new Date(),
        },
        tx,
      });

      if (params.dto.resume === undefined) {
        await this.candidateHasMediaDao.deleteManyByCandidateIdAndType({ candidateId: params.id, type: CandidateMediaType.resume, tx });
      } else if (params.dto.resume.key?.startsWith('temp/')) {
        await this.candidateHasMediaDao.deleteManyByCandidateIdAndType({ candidateId: params.id, type: CandidateMediaType.resume, tx });
        await this.createAndLinkMedia({ media: params.dto.resume, candidateId: params.id, type: CandidateMediaType.resume, tx });
      }
    });

    const newCandidate = await this.getByIdOrThrow(params.id);
    void this.recordActivity(params, oldCandidate, newCandidate);
    return { success: true, message: 'Candidate updated successfully' };
  }

  private async validate(params: Params): Promise<CandidateDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  private async createAndLinkMedia(params: { media: MediaUpsertType; candidateId: number; type: CandidateMediaType; tx: Prisma.TransactionClient }): Promise<void> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.media,
      mediaPlacement: 'candidate',
      relationId: params.candidateId,
      isImage: params.media.type === MediaTypeDtoEnum.image,
    });
    if (!file) return;

    const mediaId = await this.mediaDao.create({
      data: { key: file.newKey, name: params.media.name, type: params.media.type, size: file.size, ext: file.ext },
      tx: params.tx,
    });

    await this.candidateHasMediaDao.create({ data: { candidateId: params.candidateId, mediaId, type: params.type }, tx: params.tx });
  }

  private async recordActivity(params: Params, oldCandidate: CandidateDetailResponseType, newCandidate: CandidateDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: { firstname: oldCandidate.firstname, lastname: oldCandidate.lastname, status: oldCandidate.status, progress: oldCandidate.progress },
      newValues: { firstname: newCandidate.firstname, lastname: newCandidate.lastname, status: newCandidate.status, progress: newCandidate.progress },
    });
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Candidate updated',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.candidate, entityId: newCandidate.id }],
    });
  }
}
