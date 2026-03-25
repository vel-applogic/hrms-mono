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
  EmployeeDao,
  EmployeeHasMediaDao,
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
    employeeDao: EmployeeDao,
    employeeHasMediaDao: EmployeeHasMediaDao,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
  ) {
    super(prisma, logger, employeeDao, employeeHasMediaDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating employee documents', { id: params.id });

    await this.getByIdOrThrow(params.id);

    await this.transaction(async (tx) => {
      if (params.dto.resume !== undefined) {
        await this.employeeHasMediaDao.deleteManyByUserIdAndType({
          userId: params.id,
          type: EmployeeMediaType.resume,
          tx,
        });
        if (params.dto.resume) {
          if (params.dto.resume.key?.startsWith('temp/')) {
            await this.createAndLinkMedia({ media: params.dto.resume, userId: params.id, type: EmployeeMediaType.resume, tx });
          } else if (params.dto.resume.id) {
            await this.employeeHasMediaDao.create({
              data: { userId: params.id, mediaId: params.dto.resume.id, type: EmployeeMediaType.resume },
              tx,
            });
          }
        }
      }

      if (params.dto.offerLetters !== undefined) {
        await this.employeeHasMediaDao.deleteManyByUserIdAndType({
          userId: params.id,
          type: EmployeeMediaType.offerLetter,
          tx,
        });
        for (const media of params.dto.offerLetters) {
          if (media.key?.startsWith('temp/')) {
            await this.createAndLinkMedia({ media, userId: params.id, type: EmployeeMediaType.offerLetter, tx });
          } else if (media.id) {
            await this.employeeHasMediaDao.create({
              data: { userId: params.id, mediaId: media.id, type: EmployeeMediaType.offerLetter },
              tx,
            });
          }
        }
      }

      if (params.dto.otherDocuments !== undefined) {
        await this.employeeHasMediaDao.deleteManyByUserIdAndType({
          userId: params.id,
          type: EmployeeMediaType.otherDocuments,
          tx,
        });
        for (const media of params.dto.otherDocuments) {
          if (media.key?.startsWith('temp/')) {
            await this.createAndLinkMedia({ media, userId: params.id, type: EmployeeMediaType.otherDocuments, tx });
          } else if (media.id) {
            await this.employeeHasMediaDao.create({
              data: { userId: params.id, mediaId: media.id, type: EmployeeMediaType.otherDocuments },
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

    await this.employeeHasMediaDao.create({
      data: { userId: params.userId, mediaId, type: params.type },
      tx: params.tx,
    });
  }
}
