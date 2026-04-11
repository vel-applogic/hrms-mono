import { Injectable } from '@nestjs/common';
import type { DepartmentResponseType } from '@repo/dto';
import { CommonLoggerService, DepartmentDao, PrismaService, type DepartmentSelectTableRecordType } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { BaseUc } from '@repo/nest-lib';

@Injectable()
export class BaseDepartmentUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly departmentDao: DepartmentDao,
  ) {
    super(prisma, logger);
  }

  protected dbToDepartmentResponse(dbRec: DepartmentSelectTableRecordType): DepartmentResponseType {
    return {
      id: dbRec.id,
      name: dbRec.name,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async getDepartmentById(id: number): Promise<DepartmentResponseType> {
    try {
      const dbRec = await this.departmentDao.findById({ id });
      if (!dbRec) {
        throw new DbRecordNotFoundError('Department not found');
      }
      return this.dbToDepartmentResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Department not found');
      }
      throw error;
    }
  }
}
