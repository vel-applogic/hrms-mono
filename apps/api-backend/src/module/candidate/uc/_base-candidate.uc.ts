import { CandidateMediaType } from '@repo/db';
import type { CandidateDetailResponseType, CandidateListResponseType, MediaResponseType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
import type { CandidateDetailRecordType, CandidateListRecordType } from '@repo/nest-lib';
import {
  BaseUc,
  CandidateDao,
  candidateProgressDbEnumToDtoEnum,
  candidateSourceDbEnumToDtoEnum,
  candidateStatusDbEnumToDtoEnum,
  CommonLoggerService,
  noticePeriodUnitDbEnumToDtoEnum,
  PrismaService,
} from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

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

  public async getById(id: number, organizationId: number): Promise<CandidateDetailResponseType | undefined> {
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
      source: candidateSourceDbEnumToDtoEnum(candidate.source),
      urls: candidate.urls,
      expInYears: candidate.expInYears,
      relevantExpInYears: candidate.relevantExpInYears,
      skills: candidate.skills,
      currentCtcInLacs: candidate.currentCtcInLacs,
      expectedCtcInLacs: candidate.expectedCtcInLacs,
      noticePeriod: candidate.noticePeriod,
      noticePeriodUnit: noticePeriodUnitDbEnumToDtoEnum(candidate.noticePeriodUnit),
      status: candidateStatusDbEnumToDtoEnum(candidate.status),
      progress: candidateProgressDbEnumToDtoEnum(candidate.progress),
      dob: candidate.dob?.toISOString().split('T')[0] ?? undefined,
      pan: candidate.pan ?? undefined,
      aadhaar: candidate.aadhaar ?? undefined,
      employeeId: candidate.employeeId ?? null,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
      resume,
      offerLetters: offerLetters.length > 0 ? offerLetters : undefined,
      otherDocuments: otherDocuments.length > 0 ? otherDocuments : undefined,
    };
  }

  public async getByIdOrThrow(id: number, organizationId: number): Promise<CandidateDetailResponseType> {
    const candidate = await this.getById(id, organizationId);
    if (!candidate) throw new ApiBadRequestError('Candidate not found');
    return candidate;
  }

  protected dbToCandidateListResponse(dbRec: CandidateListRecordType): CandidateListResponseType {
    return {
      id: dbRec.id,
      firstname: dbRec.firstname,
      lastname: dbRec.lastname,
      email: dbRec.email,
      contactNumbers: dbRec.contactNumbers,
      source: candidateSourceDbEnumToDtoEnum(dbRec.source),
      urls: dbRec.urls,
      expInYears: dbRec.expInYears,
      relevantExpInYears: dbRec.relevantExpInYears,
      skills: dbRec.skills,
      currentCtcInLacs: dbRec.currentCtcInLacs,
      expectedCtcInLacs: dbRec.expectedCtcInLacs,
      noticePeriod: dbRec.noticePeriod,
      noticePeriodUnit: noticePeriodUnitDbEnumToDtoEnum(dbRec.noticePeriodUnit),
      status: candidateStatusDbEnumToDtoEnum(dbRec.status),
      progress: candidateProgressDbEnumToDtoEnum(dbRec.progress),
      dob: dbRec.dob?.toISOString().split('T')[0] ?? undefined,
      pan: dbRec.pan ?? undefined,
      aadhaar: dbRec.aadhaar ?? undefined,
      employeeId: dbRec.employeeId ?? null,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }
}
