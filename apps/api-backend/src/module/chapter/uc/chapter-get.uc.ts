import { Injectable } from '@nestjs/common';
import type { ChapterDetailResponseType } from '@repo/dto';
import { ChapterDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseChapterUc } from './_base-chapter.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class ChapterGetUc extends BaseChapterUc implements IUseCase<Params, ChapterDetailResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, chapterDao: ChapterDao, s3Service: S3Service) {
    super(prisma, logger, chapterDao, s3Service);
  }

  async execute(params: Params): Promise<ChapterDetailResponseType> {
    this.logger.i('Getting chapter', { id: params.id });

    const chapter = await this.validate(params);

    return chapter;
  }

  async validate(params: Params): Promise<ChapterDetailResponseType> {
    const chapter = await this.getById(params.id);
    if (!chapter) {
      throw new ApiError('Chapter not found', 404);
    }
    return chapter;
  }
}
