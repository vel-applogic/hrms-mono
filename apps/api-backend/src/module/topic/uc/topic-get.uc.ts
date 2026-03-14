import { Injectable } from '@nestjs/common';
import type { TopicDetailResponseType } from '@repo/dto';
import { TopicDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseTopicUc } from './_base-topic.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class TopicGetUc extends BaseTopicUc implements IUseCase<Params, TopicDetailResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, topicDao: TopicDao, s3Service: S3Service) {
    super(prisma, logger, topicDao, s3Service);
  }

  async execute(params: Params): Promise<TopicDetailResponseType> {
    this.logger.i('Getting topic', { id: params.id });

    const topic = await this.validate(params);

    return topic;
  }

  async validate(params: Params): Promise<TopicDetailResponseType> {
    const topic = await this.getById(params.id);
    if (!topic) {
      throw new ApiError('Topic not found', 404);
    }
    return topic;
  }
}
