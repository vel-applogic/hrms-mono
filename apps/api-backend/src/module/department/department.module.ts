import { Module } from '@nestjs/common';

import { DepartmentController } from './department.controller.js';
import { DepartmentCreateUc } from './uc/department-create.uc.js';
import { DepartmentDeleteUc } from './uc/department-delete.uc.js';
import { DepartmentGetUc } from './uc/department-get.uc.js';
import { DepartmentSearchUc } from './uc/department-search.uc.js';
import { DepartmentUpdateUc } from './uc/department-update.uc.js';

@Module({
  controllers: [DepartmentController],
  providers: [
    DepartmentCreateUc,
    DepartmentUpdateUc,
    DepartmentSearchUc,
    DepartmentGetUc,
    DepartmentDeleteUc,
  ],
})
export class DepartmentModule {}
