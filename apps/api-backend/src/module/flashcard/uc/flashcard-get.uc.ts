import { Injectable } from '@nestjs/common';
import type { FlashcardDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, FlashcardDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { BaseFlashcardUc } from './_base-flashcard.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class FlashcardGetUc extends BaseFlashcardUc implements IUseCase<Params, FlashcardDetailResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, flashcardDao: FlashcardDao) {
    super(prisma, logger, flashcardDao);
  }

  async execute(params: Params): Promise<FlashcardDetailResponseType> {
    this.logger.i('Getting flashcard', { id: params.id });

    const flashcard = await this.validate(params);

    return flashcard;
  }

  async validate(params: Params): Promise<FlashcardDetailResponseType> {
    const flashcard = await this.getById(params.id);
    if (!flashcard) {
      throw new ApiError('Flashcard not found', 404);
    }
    return flashcard;
  }
}
