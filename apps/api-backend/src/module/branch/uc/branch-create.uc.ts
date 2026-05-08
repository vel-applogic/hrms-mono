import { Injectable } from '@nestjs/common';
import type { BranchCreateRequestType, BranchResponseType } from '@repo/dto';
import { BranchDao, CommonLoggerService, IUseCase, PrismaService } from '@repo/nest-lib';
import type { CurrentUserType } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { BaseBranchUseCase } from './_base-branch.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: BranchCreateRequestType;
};

@Injectable()
export class BranchCreateUc extends BaseBranchUseCase implements IUseCase<Params, BranchResponseType> {
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

    const createdId = await this.transaction(async (tx) => {
      return await this.branchDao.create({
        data: {
          name: params.dto.name,
          organisation: { connect: { id: params.currentUser.organisationId } },
        },
        tx,
      });
    });

    return await this.getBranchById(createdId);
  }

  private async validate(params: Params): Promise<void> {
    const existing = await this.branchDao.findByNameAndOrganisation({
      name: params.dto.name,
      organisationId: params.currentUser.organisationId,
    });
    if (existing) {
      throw new ApiFieldValidationError('name', 'Branch name already exists');
    }
  }
}
