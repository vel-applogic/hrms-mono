import { Injectable } from '@nestjs/common';
import type { DepartmentResponseType } from '@repo/dto';
import { CommonLoggerService, DepartmentDao, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';

import { BaseDepartmentUseCase } from './_base-department.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class DepartmentGetUc extends BaseDepartmentUseCase implements IUseCase<Params, DepartmentResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    departmentDao: DepartmentDao,
  ) {
    super(prisma, logger, departmentDao);
  }

  public async execute(params: Params): Promise<DepartmentResponseType> {
    this.assertAdmin(params.currentUser);
    return await this.getDepartmentById(params.id);
  }
}
