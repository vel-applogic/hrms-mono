import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, DepartmentDao, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { BaseDepartmentUseCase } from './_base-department.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class DepartmentDeleteUc extends BaseDepartmentUseCase implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    departmentDao: DepartmentDao,
  ) {
    super(prisma, logger, departmentDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.assertAdmin(params.currentUser);

    await this.transaction(async (tx) => {
      try {
        await this.departmentDao.deleteByIdOrThrow({ id: params.id, tx });
      } catch (error) {
        if (error instanceof DbRecordNotFoundError) {
          throw new ApiBadRequestError('Department not found');
        }
        throw error;
      }
    });

    return { success: true, message: 'Department deleted successfully' };
  }
}
