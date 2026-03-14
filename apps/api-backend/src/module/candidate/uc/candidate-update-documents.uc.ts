import { Injectable } from '@nestjs/common';
import { CandidateMediaType, Prisma } from '@repo/db';
import {
  CandidateDetailResponseType,
  CandidateUpdateDocumentsRequestType,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
} from '@repo/dto';
import { CandidateDao, CandidateHasMediaDao, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseCandidateUc } from './_base-candidate.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: CandidateUpdateDocumentsRequestType;
};

@Injectable()
export class CandidateUpdateDocumentsUc extends BaseCandidateUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    candidateDao: CandidateDao,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly candidateHasMediaDao: CandidateHasMediaDao,
    private readonly mediaService: MediaService,
  ) {
    super(prisma, logger, candidateDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating candidate documents', { id: params.id });

    await this.getByIdOrThrow(params.id);

    await this.transaction(async (tx) => {
      if (params.dto.resume !== undefined) {
        await this.candidateHasMediaDao.deleteManyByCandidateIdAndType({ candidateId: params.id, type: CandidateMediaType.resume, tx });
        if (params.dto.resume) {
          if (params.dto.resume.key?.startsWith('temp/')) {
            await this.createAndLinkMedia({ media: params.dto.resume, candidateId: params.id, type: CandidateMediaType.resume, tx });
          } else if (params.dto.resume.id) {
            await this.candidateHasMediaDao.create({ data: { candidateId: params.id, mediaId: params.dto.resume.id, type: CandidateMediaType.resume }, tx });
          }
        }
      }

      if (params.dto.offerLetters !== undefined) {
        await this.candidateHasMediaDao.deleteManyByCandidateIdAndType({ candidateId: params.id, type: CandidateMediaType.offerLetter, tx });
        for (const media of params.dto.offerLetters) {
          if (media.key?.startsWith('temp/')) {
            await this.createAndLinkMedia({ media, candidateId: params.id, type: CandidateMediaType.offerLetter, tx });
          } else if (media.id) {
            await this.candidateHasMediaDao.create({ data: { candidateId: params.id, mediaId: media.id, type: CandidateMediaType.offerLetter }, tx });
          }
        }
      }

      if (params.dto.otherDocuments !== undefined) {
        await this.candidateHasMediaDao.deleteManyByCandidateIdAndType({ candidateId: params.id, type: CandidateMediaType.otherDocuments, tx });
        for (const media of params.dto.otherDocuments) {
          if (media.key?.startsWith('temp/')) {
            await this.createAndLinkMedia({ media, candidateId: params.id, type: CandidateMediaType.otherDocuments, tx });
          } else if (media.id) {
            await this.candidateHasMediaDao.create({ data: { candidateId: params.id, mediaId: media.id, type: CandidateMediaType.otherDocuments }, tx });
          }
        }
      }
    });

    return { success: true, message: 'Documents updated successfully' };
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
}
