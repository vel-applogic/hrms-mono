import { Injectable } from '@nestjs/common';
import type { DepartmentResponseType, DepartmentUpdateRequestType } from '@repo/dto';
import { CommonLoggerService, DepartmentDao, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { BaseDepartmentUseCase } from './_base-department.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: DepartmentUpdateRequestType;
};

@Injectable()
export class DepartmentUpdateUc extends BaseDepartmentUseCase implements IUseCase<Params, DepartmentResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    departmentDao: DepartmentDao,
  ) {
    super(prisma, logger, departmentDao);
  }

  public async execute(params: Params): Promise<DepartmentResponseType> {
    this.assertAdmin(params.currentUser);
    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.departmentDao.update({
        id: params.dto.id,
        data: { name: params.dto.name },
        tx,
      });
    });

    return await this.getDepartmentById(params.dto.id);
  }

  private async validate(params: Params): Promise<void> {
    await this.getDepartmentById(params.dto.id);

    const existing = await this.departmentDao.findByNameAndOrganization({
      name: params.dto.name,
      organizationId: params.currentUser.organizationId,
      excludeId: params.dto.id,
    });
    if (existing) {
      throw new ApiFieldValidationError('name', 'Department name already exists');
    }
  }
}
