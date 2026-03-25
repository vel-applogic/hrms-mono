import { Injectable } from '@nestjs/common';
import type { EmployeeDetailResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CommonLoggerService, IUseCase, PrismaService, EmployeeDao, EmployeeHasMediaDao } from '@repo/nest-lib';

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

  async execute(params: Params): Promise<EmployeeDetailResponseType> {
    this.logger.i('Getting employee', { id: params.id });
    return this.getByIdOrThrow(params.id);
  }
}
