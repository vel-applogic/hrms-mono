import { Injectable } from '@nestjs/common';
import { EmployeeMediaType } from '@repo/db';
import type { EmployeeUpdateDocumentsRequestType, OperationStatusResponseType } from '@repo/dto';
import { MediaTypeDtoEnum, MediaUpsertType } from '@repo/dto';
import {
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  MediaDao,
  PrismaService,
  UserEmployeeDetailDao,
  UserEmployeeHasMediaDao,
} from '@repo/nest-lib';
import type { Prisma } from '@repo/db';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseEmployeeUc } from './_base-employee.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeUpdateDocumentsRequestType;
};

@Injectable()
export class EmployeeUpdateDocumentsUc extends BaseEmployeeUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userEmployeeDetailDao: UserEmployeeDetailDao,
    userEmployeeHasMediaDao: UserEmployeeHasMediaDao,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
  ) {
    super(prisma, logger, userEmployeeDetailDao, userEmployeeHasMediaDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating employee documents', { id: params.id });

    await this.getByIdOrThrow(params.id);

    await this.transaction(async (tx) => {
      if (params.dto.photo !== undefined) {
        await this.userEmployeeHasMediaDao.deleteManyByUserIdAndType({
          userId: params.id,
          type: EmployeeMediaType.photo,
          tx,
        });
        if (params.dto.photo) {
          if (params.dto.photo.key?.startsWith('temp/')) {
            await this.createAndLinkMedia({ media: params.dto.photo, userId: params.id, type: EmployeeMediaType.photo, tx });
          } else if (params.dto.photo.id) {
            await this.userEmployeeHasMediaDao.create({
              data: { userId: params.id, mediaId: params.dto.photo.id, type: EmployeeMediaType.photo },
              tx,
            });
          }
        }
      }

      if (params.dto.documents !== undefined) {
        await this.userEmployeeHasMediaDao.deleteManyByUserIdAndType({
          userId: params.id,
          type: EmployeeMediaType.document,
          tx,
        });
        for (const doc of params.dto.documents) {
          const media = { key: doc.key, name: doc.name, type: doc.type, id: doc.id };
          const caption = 'caption' in doc ? doc.caption : undefined;
          if (media.key?.startsWith('temp/')) {
            await this.createAndLinkMedia({
              media,
              userId: params.id,
              type: EmployeeMediaType.document,
              caption,
              tx,
            });
          } else if (media.id) {
            await this.userEmployeeHasMediaDao.create({
              data: {
                userId: params.id,
                mediaId: media.id,
                type: EmployeeMediaType.document,
                caption,
              },
              tx,
            });
          }
        }
      }
    });

    return { success: true, message: 'Documents updated successfully' };
  }

  private async createAndLinkMedia(params: {
    media: MediaUpsertType;
    userId: number;
    type: EmployeeMediaType;
    caption?: string;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.media,
      mediaPlacement: 'employee',
      relationId: params.userId,
      isImage: params.media.type === MediaTypeDtoEnum.image,
    });
    if (!file) return;

    const mediaId = await this.mediaDao.create({
      data: { key: file.newKey, name: params.media.name, type: params.media.type, size: file.size, ext: file.ext },
      tx: params.tx,
    });

    await this.userEmployeeHasMediaDao.create({
      data: { userId: params.userId, mediaId, type: params.type, caption: params.caption },
      tx: params.tx,
    });
  }
}
