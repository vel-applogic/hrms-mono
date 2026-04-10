import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { ReimbursementResponseType, ReimbursementUpdateStatusRequestType } from '@repo/dto';
import { ReimbursementStatusDtoEnum } from '@repo/dto';
import {
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  PrismaService,
  ReimbursementDao,
  ReimbursementHasFeedbackDao,
  ReimbursementHasMediaDao,
  reimbursementStatusDtoEnumToDbEnum,
} from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseReimbursementUseCase } from './_base-reimbursement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: ReimbursementUpdateStatusRequestType;
};

@Injectable()
export class ReimbursementUpdateStatusUc extends BaseReimbursementUseCase implements IUseCase<Params, ReimbursementResponseType> {
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

  public async execute(params: Params): Promise<ReimbursementResponseType> {
    this.logger.i('Updating reimbursement status', { id: params.id, status: params.dto.status });
    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.updateStatus(params, tx);
    });

    return await this.getReimbursementResponseById(params.id, params.currentUser.organizationId);
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);

    if (params.dto.status === ReimbursementStatusDtoEnum.rejected && !params.dto.rejectReason) {
      throw new ApiBadRequestError('Reject reason is required when rejecting');
    }
  }

  private async updateStatus(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    const now = new Date();
    const updateData: Record<string, unknown> = {
      status: reimbursementStatusDtoEnumToDbEnum(params.dto.status),
    };

    if (params.dto.status === ReimbursementStatusDtoEnum.approved) {
      updateData.approvedAt = now;
    }

    if (params.dto.status === ReimbursementStatusDtoEnum.paid) {
      updateData.paidAt = now;
    }

    if (params.dto.status === ReimbursementStatusDtoEnum.rejected) {
      updateData.rejectReason = params.dto.rejectReason;
    }

    await this.reimbursementDao.update({
      id: params.id,
      data: updateData,
      tx,
    });

    if (params.dto.status === ReimbursementStatusDtoEnum.rejected && params.dto.rejectReason) {
      await this.reimbursementHasFeedbackDao.create({
        data: {
          reimbursementId: params.id,
          createdById: params.currentUser.id,
          message: params.dto.rejectReason,
        },
        tx,
      });
    }
  }
}
