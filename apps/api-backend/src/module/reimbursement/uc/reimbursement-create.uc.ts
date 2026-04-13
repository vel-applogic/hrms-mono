import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { ReimbursementCreateRequestType, ReimbursementResponseType, UpsertMediaType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
import {
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  MediaDao,
  PrismaService,
  ReimbursementDao,
  ReimbursementHasFeedbackDao,
  ReimbursementHasMediaDao,
} from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseReimbursementUseCase } from './_base-reimbursement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: ReimbursementCreateRequestType;
};

@Injectable()
export class ReimbursementCreateUc extends BaseReimbursementUseCase implements IUseCase<Params, ReimbursementResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    reimbursementDao: ReimbursementDao,
    reimbursementHasMediaDao: ReimbursementHasMediaDao,
    reimbursementHasFeedbackDao: ReimbursementHasFeedbackDao,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
  ) {
    super(prisma, logger, reimbursementDao, reimbursementHasMediaDao, reimbursementHasFeedbackDao, s3Service);
  }

  public async execute(params: Params): Promise<ReimbursementResponseType> {
    this.logger.i('Creating reimbursement', { title: params.dto.title });

    const createdId = await this.transaction(async (tx) => {
      return await this.create(params, tx);
    });

    return await this.getReimbursementResponseById(createdId, params.currentUser.organizationId);
  }

  private async create(params: Params, tx: Prisma.TransactionClient): Promise<number> {
    const createdId = await this.reimbursementDao.create({
      data: {
        title: params.dto.title,
        amount: params.dto.amount,
        date: new Date(params.dto.date),
        organization: { connect: { id: params.currentUser.organizationId } },
        user: { connect: { id: params.currentUser.id } },
      },
      tx,
    });

    if (params.dto.files && params.dto.files.length > 0) {
      for (const media of params.dto.files) {
        await this.createAndLinkMedia({
          media,
          reimbursementId: createdId,
          organizationId: params.currentUser.organizationId,
          tx,
        });
      }
    }

    return createdId;
  }

  private async createAndLinkMedia(params: {
    media: UpsertMediaType;
    reimbursementId: number;
    organizationId: number;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    if (params.media.id) {
      await this.reimbursementHasMediaDao.create({
        data: { reimbursementId: params.reimbursementId, mediaId: params.media.id },
        tx: params.tx,
      });
      return;
    }

    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.media,
      mediaPlacement: 'reimbursement',
      relationId: params.reimbursementId,
      isImage: params.media.type === MediaTypeDtoEnum.image,
    });
    if (!file) return;

    const mediaId = await this.mediaDao.create({
      data: {
        key: file.newKey,
        name: params.media.name,
        type: params.media.type,
        size: file.size,
        ext: file.ext,
        organization: { connect: { id: params.organizationId } },
      },
      tx: params.tx,
    });

    await this.reimbursementHasMediaDao.create({
      data: { reimbursementId: params.reimbursementId, mediaId },
      tx: params.tx,
    });
  }
}
