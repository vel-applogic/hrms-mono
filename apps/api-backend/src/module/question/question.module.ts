import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { MediaService } from '#src/service/media.service.js';

import { QuestionController } from './question.controller.js';
import { QuestionCreateUc } from './uc/question-create.uc.js';
import { QuestionDeleteUc } from './uc/question-delete.uc.js';
import { QuestionGetUc } from './uc/question-get.uc.js';
import { QuestionSearchUc } from './uc/question-search.uc.js';
import { QuestionUpdateUc } from './uc/question-update.uc.js';

@Module({
  imports: [ExternalServiceModule],
  controllers: [QuestionController],
  providers: [QuestionSearchUc, QuestionGetUc, QuestionCreateUc, QuestionUpdateUc, QuestionDeleteUc, MediaService],
})
export class QuestionModule {}
