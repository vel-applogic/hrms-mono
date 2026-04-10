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
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseReimbursementUseCase } from './_base-reimbursement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  reimbursementId: number;
  feedbackId: number;
  dto: ReimbursementAddFeedbackRequestType;
};

@Injectable()
export class ReimbursementUpdateFeedbackUc extends BaseReimbursementUseCase implements IUseCase<Params, ReimbursementDetailResponseType> {
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
    this.logger.i('Updating reimbursement feedback', { feedbackId: params.feedbackId });
    this.assertAdmin(params.currentUser);

    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.reimbursementHasFeedbackDao.update({
        id: params.feedbackId,
        data: { message: params.dto.message },
        tx,
      });
    });

    return await this.getReimbursementById(params.reimbursementId, params.currentUser.organizationId);
  }

  private async validate(params: Params): Promise<void> {
    try {
      const feedback = await this.reimbursementHasFeedbackDao.getByIdOrThrow({ id: params.feedbackId });
      if (feedback.reimbursementId !== params.reimbursementId) {
        throw new ApiBadRequestError('Feedback does not belong to this reimbursement');
      }
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Feedback not found');
      }
      throw error;
    }
  }
}
