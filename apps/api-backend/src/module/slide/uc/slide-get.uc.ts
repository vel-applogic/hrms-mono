import { Injectable } from '@nestjs/common';
import type { SlideDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, SlideDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseSlideUc } from './_base-slide.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class SlideGetUc extends BaseSlideUc implements IUseCase<Params, SlideDetailResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, slideDao: SlideDao, s3Service: S3Service) {
    super(prisma, logger, slideDao, s3Service);
  }

  async execute(params: Params): Promise<SlideDetailResponseType> {
    this.logger.i('Getting slide', { id: params.id });

    const slide = await this.validate(params);

    return slide;
  }

  async validate(params: Params): Promise<SlideDetailResponseType> {
    const slide = await this.getById(params.id);
    if (!slide) {
      throw new ApiError('Slide not found', 404);
    }
    return slide;
  }
}
