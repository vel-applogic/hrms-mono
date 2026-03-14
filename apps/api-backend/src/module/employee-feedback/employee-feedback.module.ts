import { Module } from '@nestjs/common';

import { EmployeeFeedbackController } from './employee-feedback.controller.js';
import { EmployeeFeedbackCreateUc } from './uc/employee-feedback-create.uc.js';
import { EmployeeFeedbackDeleteUc } from './uc/employee-feedback-delete.uc.js';
import { EmployeeFeedbackListUc } from './uc/employee-feedback-list.uc.js';
import { EmployeeFeedbackUpdateUc } from './uc/employee-feedback-update.uc.js';

@Module({
  controllers: [EmployeeFeedbackController],
  providers: [EmployeeFeedbackListUc, EmployeeFeedbackCreateUc, EmployeeFeedbackUpdateUc, EmployeeFeedbackDeleteUc],
})
export class EmployeeFeedbackModule {}
