import { Injectable } from '@nestjs/common';
import type { ReimbursementAddFeedbackRequestType, ReimbursementDetailResponseType } from '@repo/dto';
import {
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  PrismaService,
  ReimbursementDao,
  ReimbursementHasFeedbackDao,
  ReimbursementHasMediaDao,
} from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseReimbursementUseCase } from './_base-reimbursement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: ReimbursementAddFeedbackRequestType;
};

@Injectable()
export class ReimbursementAddFeedbackUc extends BaseReimbursementUseCase implements IUseCase<Params, ReimbursementDetailResponseType> {
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
    this.logger.i('Adding feedback to reimbursement', { id: params.id });
    this.assertAdmin(params.currentUser);

    await this.transaction(async (tx) => {
      await this.reimbursementHasFeedbackDao.create({
        data: {
          reimbursementId: params.id,
          createdById: params.currentUser.id,
          message: params.dto.message,
        },
        tx,
      });
    });

    return await this.getReimbursementById(params.id, params.currentUser.organizationId);
  }
}
