import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';

import { FlashcardController } from './flashcard.controller.js';
import { FlashcardCreateUc } from './uc/flashcard-create.uc.js';
import { FlashcardDeleteUc } from './uc/flashcard-delete.uc.js';
import { FlashcardGetUc } from './uc/flashcard-get.uc.js';
import { FlashcardSearchUc } from './uc/flashcard-search.uc.js';
import { FlashcardUpdateUc } from './uc/flashcard-update.uc.js';

@Module({
  imports: [ExternalServiceModule],
  controllers: [FlashcardController],
  providers: [FlashcardSearchUc, FlashcardGetUc, FlashcardCreateUc, FlashcardUpdateUc, FlashcardDeleteUc],
})
export class FlashcardModule {}
