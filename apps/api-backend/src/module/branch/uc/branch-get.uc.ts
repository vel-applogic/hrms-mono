import { Injectable } from '@nestjs/common';
import type { BranchResponseType } from '@repo/dto';
import { BranchDao, CommonLoggerService, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';

import { BaseBranchUseCase } from './_base-branch.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class BranchGetUc extends BaseBranchUseCase implements IUseCase<Params, BranchResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    branchDao: BranchDao,
  ) {
    super(prisma, logger, branchDao);
  }

  public async execute(params: Params): Promise<BranchResponseType> {
    this.assertAdmin(params.currentUser);
    return await this.getBranchById(params.id);
  }
}
