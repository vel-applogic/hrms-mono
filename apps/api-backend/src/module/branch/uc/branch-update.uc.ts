import { Injectable } from '@nestjs/common';
import type { BranchResponseType, BranchUpdateRequestType } from '@repo/dto';
import { BranchDao, CommonLoggerService, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { BaseBranchUseCase } from './_base-branch.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: BranchUpdateRequestType;
};

@Injectable()
export class BranchUpdateUc extends BaseBranchUseCase implements IUseCase<Params, BranchResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    branchDao: BranchDao,
  ) {
    super(prisma, logger, branchDao);
  }

  public async execute(params: Params): Promise<BranchResponseType> {
    this.assertAdmin(params.currentUser);
    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.branchDao.update({
        id: params.dto.id,
        data: { name: params.dto.name },
        tx,
      });
    });

    return await this.getBranchById(params.dto.id);
  }

  private async validate(params: Params): Promise<void> {
    await this.getBranchById(params.dto.id);

    const existing = await this.branchDao.findByNameAndOrganization({
      name: params.dto.name,
      organizationId: params.currentUser.organizationId,
      excludeId: params.dto.id,
    });
    if (existing) {
      throw new ApiFieldValidationError('name', 'Branch name already exists');
    }
  }
}
