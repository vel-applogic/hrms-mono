import { Injectable } from '@nestjs/common';
import type { MediaResponseType, ReimbursementDetailResponseType, ReimbursementFeedbackResponseType, ReimbursementResponseType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
import type { ReimbursementListRecordType, ReimbursementWithRelationsType } from '@repo/nest-lib';
import {
  BaseUc,
  CommonLoggerService,
  PrismaService,
  ReimbursementDao,
  ReimbursementHasFeedbackDao,
  ReimbursementHasMediaDao,
  reimbursementStatusDbEnumToDtoEnum,
} from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

@Injectable()
export class BaseReimbursementUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly reimbursementDao: ReimbursementDao,
    protected readonly reimbursementHasMediaDao: ReimbursementHasMediaDao,
    protected readonly reimbursementHasFeedbackDao: ReimbursementHasFeedbackDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  private mapFeedback(fb: ReimbursementWithRelationsType['reimbursementHasFeedbacks'][number]): ReimbursementFeedbackResponseType {
    return {
      id: fb.id,
      message: fb.message,
      createdBy: {
        id: fb.createdBy.id,
        firstname: fb.createdBy.firstname,
        lastname: fb.createdBy.lastname,
      },
      createdAt: fb.createdAt.toISOString(),
    };
  }

  protected dbToReimbursementResponse(dbRec: ReimbursementListRecordType): ReimbursementResponseType {
    const lastFeedback = dbRec.reimbursementHasFeedbacks.length > 0
      ? this.mapFeedback(dbRec.reimbursementHasFeedbacks[0]!)
      : null;

    return {
      id: dbRec.id,
      title: dbRec.title,
      amount: dbRec.amount,
      userId: dbRec.userId,
      user: {
        id: dbRec.user.id,
        firstname: dbRec.user.firstname,
        lastname: dbRec.user.lastname,
        email: dbRec.user.email,
      },
      status: reimbursementStatusDbEnumToDtoEnum(dbRec.status),
      rejectReason: dbRec.rejectReason,
      approvedAt: dbRec.approvedAt?.toISOString() ?? null,
      paidAt: dbRec.paidAt?.toISOString() ?? null,
      lastFeedback,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async dbToReimbursementDetailResponse(dbRec: ReimbursementWithRelationsType): Promise<ReimbursementDetailResponseType> {
    const medias: MediaResponseType[] = await Promise.all(
      dbRec.reimbursementHasMedias.map(async (rhm) => {
        const urlFull = await this.s3Service.getSignedUrl(rhm.media.key);
        return {
          id: rhm.media.id,
          name: rhm.media.name,
          key: rhm.media.key,
          urlFull,
          type: MediaTypeDtoEnum[rhm.media.type],
          size: rhm.media.size,
          ext: rhm.media.ext,
        };
      }),
    );

    const feedbacks = dbRec.reimbursementHasFeedbacks.map((fb) => this.mapFeedback(fb));

    const lastFeedback = feedbacks.length > 0 ? feedbacks[0]! : null;

    return {
      id: dbRec.id,
      title: dbRec.title,
      amount: dbRec.amount,
      userId: dbRec.userId,
      user: {
        id: dbRec.user.id,
        firstname: dbRec.user.firstname,
        lastname: dbRec.user.lastname,
        email: dbRec.user.email,
      },
      status: reimbursementStatusDbEnumToDtoEnum(dbRec.status),
      rejectReason: dbRec.rejectReason,
      approvedAt: dbRec.approvedAt?.toISOString() ?? null,
      paidAt: dbRec.paidAt?.toISOString() ?? null,
      lastFeedback,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
      medias,
      feedbacks,
    };
  }

  protected async getReimbursementById(id: number, organizationId: number): Promise<ReimbursementDetailResponseType> {
    try {
      const dbRec = await this.reimbursementDao.getByIdOrThrow({ id, organizationId });
      return await this.dbToReimbursementDetailResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Reimbursement not found');
      }
      throw error;
    }
  }

  protected async getReimbursementResponseById(id: number, organizationId: number): Promise<ReimbursementResponseType> {
    try {
      const dbRec = await this.reimbursementDao.getByIdOrThrow({ id, organizationId });
      return this.dbToReimbursementResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Reimbursement not found');
      }
      throw error;
    }
  }
}
