import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { BranchDao, CommonLoggerService, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { BaseBranchUseCase } from './_base-branch.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class BranchDeleteUc extends BaseBranchUseCase implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    branchDao: BranchDao,
  ) {
    super(prisma, logger, branchDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.assertAdmin(params.currentUser);

    await this.transaction(async (tx) => {
      try {
        await this.branchDao.deleteByIdOrThrow({ id: params.id, tx });
      } catch (error) {
        if (error instanceof DbRecordNotFoundError) {
          throw new ApiBadRequestError('Branch not found');
        }
        throw error;
      }
    });

    return { success: true, message: 'Branch deleted successfully' };
  }
}
