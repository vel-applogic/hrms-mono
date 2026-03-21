import { Module } from '@nestjs/common';

import { EmployeeDeductionController } from './employee-deduction.controller.js';
import { EmployeeDeductionCreateUc } from './uc/employee-deduction-create.uc.js';
import { EmployeeDeductionDeleteUc } from './uc/employee-deduction-delete.uc.js';
import { EmployeeDeductionListUc } from './uc/employee-deduction-list.uc.js';
import { EmployeeDeductionUpdateUc } from './uc/employee-deduction-update.uc.js';

@Module({
  controllers: [EmployeeDeductionController],
  providers: [EmployeeDeductionListUc, EmployeeDeductionCreateUc, EmployeeDeductionUpdateUc, EmployeeDeductionDeleteUc],
})
export class EmployeeDeductionModule {}
