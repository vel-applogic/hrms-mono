import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { ServiceModule } from '#src/service/service.module.js';

import { EmployeeBgvFeedbackController } from './employee-bgv-feedback.controller.js';
import { EmployeeBgvFeedbackCreateUc } from './uc/employee-bgv-feedback-create.uc.js';
import { EmployeeBgvFeedbackDeleteUc } from './uc/employee-bgv-feedback-delete.uc.js';
import { EmployeeBgvFeedbackListUc } from './uc/employee-bgv-feedback-list.uc.js';
import { EmployeeBgvFeedbackUpdateUc } from './uc/employee-bgv-feedback-update.uc.js';

@Module({
  imports: [ExternalServiceModule, ServiceModule],
  controllers: [EmployeeBgvFeedbackController],
  providers: [EmployeeBgvFeedbackListUc, EmployeeBgvFeedbackCreateUc, EmployeeBgvFeedbackUpdateUc, EmployeeBgvFeedbackDeleteUc],
})
export class EmployeeBgvFeedbackModule {}
