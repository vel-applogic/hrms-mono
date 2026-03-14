import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { ServiceModule } from '#src/service/service.module.js';

import { EmployeeController } from './employee.controller.js';
import { EmployeeCreateUc } from './uc/employee-create.uc.js';
import { EmployeeDeleteUc } from './uc/employee-delete.uc.js';
import { EmployeeGetUc } from './uc/employee-get.uc.js';
import { EmployeeSearchUc } from './uc/employee-search.uc.js';
import { EmployeeUpdateUc } from './uc/employee-update.uc.js';
import { EmployeeUpdateDocumentsUc } from './uc/employee-update-documents.uc.js';

@Module({
  imports: [ExternalServiceModule, ServiceModule],
  controllers: [EmployeeController],
  providers: [
    EmployeeSearchUc,
    EmployeeGetUc,
    EmployeeCreateUc,
    EmployeeUpdateUc,
    EmployeeUpdateDocumentsUc,
    EmployeeDeleteUc,
  ],
})
export class EmployeeModule {}
