import { Injectable } from '@nestjs/common';
import type { BranchResponseType } from '@repo/dto';
import { BranchDao, CommonLoggerService, PrismaService, type BranchSelectTableRecordType } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { BaseUc } from '@repo/nest-lib';

@Injectable()
export class BaseBranchUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly branchDao: BranchDao,
  ) {
    super(prisma, logger);
  }

  protected dbToBranchResponse(dbRec: BranchSelectTableRecordType): BranchResponseType {
    return {
      id: dbRec.id,
      name: dbRec.name,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async getBranchById(id: number): Promise<BranchResponseType> {
    try {
      const dbRec = await this.branchDao.findById({ id });
      if (!dbRec) {
        throw new DbRecordNotFoundError('Branch not found');
      }
      return this.dbToBranchResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Branch not found');
      }
      throw error;
    }
  }
}
