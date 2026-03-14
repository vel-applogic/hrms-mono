import { Module } from '@nestjs/common';

import { CandidateFeedbackController } from './candidate-feedback.controller.js';
import { CandidateFeedbackCreateUc } from './uc/candidate-feedback-create.uc.js';
import { CandidateFeedbackDeleteUc } from './uc/candidate-feedback-delete.uc.js';
import { CandidateFeedbackListUc } from './uc/candidate-feedback-list.uc.js';
import { CandidateFeedbackUpdateUc } from './uc/candidate-feedback-update.uc.js';

@Module({
  controllers: [CandidateFeedbackController],
  providers: [CandidateFeedbackListUc, CandidateFeedbackCreateUc, CandidateFeedbackUpdateUc, CandidateFeedbackDeleteUc],
})
export class CandidateFeedbackModule {}
