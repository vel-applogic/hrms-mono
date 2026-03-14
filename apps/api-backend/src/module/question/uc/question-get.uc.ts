import { Injectable } from '@nestjs/common';
import type { QuestionDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, QuestionDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseQuestionUc } from './_base-question.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class QuestionGetUc extends BaseQuestionUc implements IUseCase<Params, QuestionDetailResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, questionDao: QuestionDao, s3Service: S3Service) {
    super(prisma, logger, questionDao, s3Service);
  }

  async execute(params: Params): Promise<QuestionDetailResponseType> {
    this.logger.i('Getting question', { id: params.id });

    const question = await this.validate(params);

    return question;
  }

  async validate(params: Params): Promise<QuestionDetailResponseType> {
    const question = await this.getById(params.id);
    if (!question) {
      throw new ApiError('Question not found', 404);
    }
    return question;
  }
}
