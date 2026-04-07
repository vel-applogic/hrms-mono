import { Injectable } from '@nestjs/common';
import type { EmployeeDetailResponseType } from '@repo/dto';
import { UserRoleDtoEnum } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, PrismaService, EmployeeDao, EmployeeHasMediaDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseEmployeeUc } from './_base-employee.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeGetUc extends BaseEmployeeUc implements IUseCase<Params, EmployeeDetailResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    employeeDao: EmployeeDao,
    employeeHasMediaDao: EmployeeHasMediaDao,
    s3Service: S3Service,
  ) {
    super(prisma, logger, employeeDao, employeeHasMediaDao, s3Service);
  }

  public async execute(params: Params): Promise<EmployeeDetailResponseType> {
    this.logger.i('Getting employee', { id: params.id });
    await this.validate(params);
    return await this.fetchById(params);
  }

  private async validate(params: Params): Promise<void> {
    const isAdmin = params.currentUser.isSuperAdmin || params.currentUser.roles.includes(UserRoleDtoEnum.admin);
    if (!isAdmin && params.currentUser.id !== params.id) {
      throw new ApiBadRequestError('Not authorized to view this employee');
    }
  }

  private async fetchById(params: Params): Promise<EmployeeDetailResponseType> {
    return await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
  }
}
