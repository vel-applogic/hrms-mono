import { CandidateMediaType } from '@repo/db';
import type { CandidateDetailResponseType, CandidateListResponseType, MediaResponseType } from '@repo/dto';
import { CandidateProgressDtoEnum, CandidateSourceDtoEnum, CandidateStatusDtoEnum, MediaTypeDtoEnum, NoticePeriodUnitDtoEnum } from '@repo/dto';
import type { CandidateDetailRecordType, CandidateListRecordType } from '@repo/nest-lib';
import { BaseUc, CandidateDao, CommonLoggerService, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

export class BaseCandidateUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly candidateDao: CandidateDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  private async mapMediaRecord(media: CandidateDetailRecordType['candidateHasMedias'][number]['media']): Promise<MediaResponseType> {
    const urlFull = await this.s3Service.getSignedUrl(media.key);
    return {
      id: media.id,
      name: media.name,
      key: media.key,
      urlFull,
      type: MediaTypeDtoEnum[media.type],
      size: media.size,
      ext: media.ext,
    };
  }

  async getById(id: number, organizationId: number): Promise<CandidateDetailResponseType | undefined> {
    const candidate = await this.candidateDao.getById({ id, organizationId });
    if (!candidate) return undefined;

    const resumeRecord = candidate.candidateHasMedias.find((m) => m.type === CandidateMediaType.resume);
    const offerLetterRecords = candidate.candidateHasMedias.filter((m) => m.type === CandidateMediaType.offerLetter);
    const otherDocumentRecords = candidate.candidateHasMedias.filter((m) => m.type === CandidateMediaType.otherDocuments);

    const resume = resumeRecord ? await this.mapMediaRecord(resumeRecord.media) : undefined;
    const offerLetters = await Promise.all(offerLetterRecords.map((r) => this.mapMediaRecord(r.media)));
    const otherDocuments = await Promise.all(otherDocumentRecords.map((r) => this.mapMediaRecord(r.media)));

    return {
      id: candidate.id,
      firstname: candidate.firstname,
      lastname: candidate.lastname,
      email: candidate.email,
      contactNumbers: candidate.contactNumbers,
      source: candidate.source as unknown as CandidateSourceDtoEnum,
      urls: candidate.urls,
      expInYears: candidate.expInYears,
      relevantExpInYears: candidate.relevantExpInYears,
      skills: candidate.skills,
      currentCtcInLacs: candidate.currentCtcInLacs,
      expectedCtcInLacs: candidate.expectedCtcInLacs,
      noticePeriod: candidate.noticePeriod,
      noticePeriodUnit: candidate.noticePeriodUnit as unknown as NoticePeriodUnitDtoEnum,
      status: candidate.status as unknown as CandidateStatusDtoEnum,
      progress: candidate.progress as unknown as CandidateProgressDtoEnum,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
      resume,
      offerLetters: offerLetters.length > 0 ? offerLetters : undefined,
      otherDocuments: otherDocuments.length > 0 ? otherDocuments : undefined,
    };
  }

  async getByIdOrThrow(id: number, organizationId: number): Promise<CandidateDetailResponseType> {
    const candidate = await this.getById(id, organizationId);
    if (!candidate) throw new ApiError('Candidate not found', 404);
    return candidate;
  }

  protected dbToCandidateListResponse(dbRec: CandidateListRecordType): CandidateListResponseType {
    return {
      id: dbRec.id,
      firstname: dbRec.firstname,
      lastname: dbRec.lastname,
      email: dbRec.email,
      contactNumbers: dbRec.contactNumbers,
      source: dbRec.source as unknown as CandidateSourceDtoEnum,
      urls: dbRec.urls,
      expInYears: dbRec.expInYears,
      relevantExpInYears: dbRec.relevantExpInYears,
      skills: dbRec.skills,
      currentCtcInLacs: dbRec.currentCtcInLacs,
      expectedCtcInLacs: dbRec.expectedCtcInLacs,
      noticePeriod: dbRec.noticePeriod,
      noticePeriodUnit: dbRec.noticePeriodUnit as unknown as NoticePeriodUnitDtoEnum,
      status: dbRec.status as unknown as CandidateStatusDtoEnum,
      progress: dbRec.progress as unknown as CandidateProgressDtoEnum,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }
}
