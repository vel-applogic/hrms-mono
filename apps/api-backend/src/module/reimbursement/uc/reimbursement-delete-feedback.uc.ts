import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
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
};

@Injectable()
export class ReimbursementDeleteFeedbackUc extends BaseReimbursementUseCase implements IUseCase<Params, OperationStatusResponseType> {
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

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting reimbursement feedback', { feedbackId: params.feedbackId });
    this.assertAdmin(params.currentUser);

    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.reimbursementHasFeedbackDao.deleteByIdOrThrow({ id: params.feedbackId, tx });
    });

    return { success: true, message: 'Feedback deleted' };
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
