import { Injectable } from '@nestjs/common';
import { CandidateMediaType, Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  CandidateCreateRequestType,
  CandidateDetailResponseType,
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
  dto: CandidateCreateRequestType;
};

@Injectable()
export class CandidateCreateUc extends BaseCandidateUc implements IUseCase<Params, OperationStatusResponseType> {
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

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating candidate', { email: params.dto.email });
    await this.validate(params);

    const createdId = await this.transaction(async (tx) => {
      const candidateId = await this.createCandidate(params, tx);
      if (params.dto.resume) {
        await this.createAndLinkMedia({ media: params.dto.resume, candidateId, organizationId: params.currentUser.organizationId, type: CandidateMediaType.resume, tx });
      }
      return candidateId;
    });

    const candidate = await this.getByIdOrThrow(createdId, params.currentUser.organizationId);
    void this.recordActivity(params, candidate);
    return { success: true, message: 'Candidate created successfully' };
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async createCandidate(params: Params, tx: Prisma.TransactionClient): Promise<number> {
    return await this.candidateDao.create({
      data: {
        organization: { connect: { id: params.currentUser.organizationId } },
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
        dob: params.dto.dob ? new Date(params.dto.dob) : undefined,
        pan: params.dto.pan ?? undefined,
        aadhaar: params.dto.aadhaar ?? undefined,
      },
      tx,
    });
  }

  private async createAndLinkMedia(params: { media: MediaUpsertType; candidateId: number; organizationId: number; type: CandidateMediaType; tx: Prisma.TransactionClient }): Promise<void> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.media,
      mediaPlacement: 'candidate',
      relationId: params.candidateId,
      isImage: params.media.type === MediaTypeDtoEnum.image,
    });
    if (!file) return;

    const mediaId = await this.mediaDao.create({
      data: { key: file.newKey, name: params.media.name, type: params.media.type, size: file.size, ext: file.ext, organization: { connect: { id: params.organizationId } } },
      tx: params.tx,
    });

    await this.candidateHasMediaDao.create({ data: { candidateId: params.candidateId, mediaId, type: params.type }, tx: params.tx });
  }

  private async recordActivity(params: Params, created: CandidateDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: { firstname: created.firstname, lastname: created.lastname, email: created.email },
    });
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Candidate created',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.candidate, entityId: created.id }],
    });
  }
}
