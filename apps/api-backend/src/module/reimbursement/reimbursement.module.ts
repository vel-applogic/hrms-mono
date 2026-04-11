import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { ServiceModule } from '#src/service/service.module.js';

import { ReimbursementController } from './reimbursement.controller.js';
import { ReimbursementAddFeedbackUc } from './uc/reimbursement-add-feedback.uc.js';
import { ReimbursementCreateUc } from './uc/reimbursement-create.uc.js';
import { ReimbursementDeleteFeedbackUc } from './uc/reimbursement-delete-feedback.uc.js';
import { ReimbursementGetUc } from './uc/reimbursement-get.uc.js';
import { ReimbursementListUc } from './uc/reimbursement-list.uc.js';
import { ReimbursementPendingCountUc } from './uc/reimbursement-pending-count.uc.js';
import { ReimbursementUpdateFeedbackUc } from './uc/reimbursement-update-feedback.uc.js';
import { ReimbursementUpdateStatusUc } from './uc/reimbursement-update-status.uc.js';

@Module({
  imports: [ExternalServiceModule, ServiceModule],
  controllers: [ReimbursementController],
  providers: [
    ReimbursementListUc,
    ReimbursementGetUc,
    ReimbursementCreateUc,
    ReimbursementUpdateStatusUc,
    ReimbursementPendingCountUc,
    ReimbursementAddFeedbackUc,
    ReimbursementUpdateFeedbackUc,
    ReimbursementDeleteFeedbackUc,
  ],
})
export class ReimbursementModule {}
