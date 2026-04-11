import { Injectable } from '@nestjs/common';
import type { DepartmentCreateRequestType, DepartmentResponseType } from '@repo/dto';
import { CommonLoggerService, DepartmentDao, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { BaseDepartmentUseCase } from './_base-department.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: DepartmentCreateRequestType;
};

@Injectable()
export class DepartmentCreateUc extends BaseDepartmentUseCase implements IUseCase<Params, DepartmentResponseType> {
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

    const createdId = await this.transaction(async (tx) => {
      return await this.departmentDao.create({
        data: {
          name: params.dto.name,
          organization: { connect: { id: params.currentUser.organizationId } },
        },
        tx,
      });
    });

    return await this.getDepartmentById(createdId);
  }

  private async validate(params: Params): Promise<void> {
    const existing = await this.departmentDao.findByNameAndOrganization({
      name: params.dto.name,
      organizationId: params.currentUser.organizationId,
    });
    if (existing) {
      throw new ApiFieldValidationError('name', 'Department name already exists');
    }
  }
}
