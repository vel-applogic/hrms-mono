import { Injectable } from '@nestjs/common';
import type { ReimbursementDetailResponseType } from '@repo/dto';
import { UserRoleDtoEnum } from '@repo/dto';
import {
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  PrismaService,
  ReimbursementDao,
  ReimbursementHasFeedbackDao,
  ReimbursementHasMediaDao,
} from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseReimbursementUseCase } from './_base-reimbursement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class ReimbursementGetUc extends BaseReimbursementUseCase implements IUseCase<Params, ReimbursementDetailResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    reimbursementDao: ReimbursementDao,
    reimbursementHasMediaDao: ReimbursementHasMediaDao,
    reimbursementHasFeedbackDao: ReimbursementHasFeedbackDao,
    s3Service: S3Service,
  ) {
    super(prisma, logger, reimbursementDao, reimbursementHasMediaDao, reimbursementHasFeedbackDao, s3Service);
  }

  public async execute(params: Params): Promise<ReimbursementDetailResponseType> {
    this.logger.i('Getting reimbursement', { id: params.id });

    const detail = await this.getReimbursementById(params.id, params.currentUser.organizationId);

    const isAdmin = params.currentUser.isSuperAdmin || params.currentUser.roles.includes(UserRoleDtoEnum.admin);
    if (!isAdmin && detail.userId !== params.currentUser.id) {
      throw new ApiBadRequestError('You can only view your own reimbursement requests');
    }

    return detail;
  }
}
