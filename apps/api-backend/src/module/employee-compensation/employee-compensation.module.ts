import { Module } from '@nestjs/common';

import { EmployeeCompensationController } from './employee-compensation.controller.js';
import { EmployeeCompensationCreateUc } from './uc/employee-compensation-create.uc.js';
import { EmployeeCompensationListUc } from './uc/employee-compensation-list.uc.js';
import { EmployeeCompensationUpdateUc } from './uc/employee-compensation-update.uc.js';

@Module({
  controllers: [EmployeeCompensationController],
  providers: [EmployeeCompensationListUc, EmployeeCompensationCreateUc, EmployeeCompensationUpdateUc],
})
export class EmployeeCompensationModule {}
