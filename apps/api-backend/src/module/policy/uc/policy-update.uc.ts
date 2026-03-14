import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  OperationStatusResponseType,
  PolicyDetailResponseType,
  PolicyUpdateRequestType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PolicyDao, PolicyHasMediaDao, PrismaService } from '@repo/nest-lib';
import { ApiError, ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BasePolicyUc } from './_base-policy.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: PolicyUpdateRequestType;
};

@Injectable()
export class PolicyUpdateUc extends BasePolicyUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    policyDao: PolicyDao,
    s3Service: S3Service,
    private readonly policyHasMediaDao: PolicyHasMediaDao,
    private readonly mediaDao: MediaDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, policyDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating policy', { id: params.id });

    const oldPolicy = await this.validate(params);
    await this.transaction(async (tx) => {
      await this.update(params.id, params.dto, tx);
      if (params.dto.mediaIds !== undefined) {
        await this.linkMediasToPolicy({ policyId: params.id, mediaIds: params.dto.mediaIds, tx });
      }
    });
    const newPolicy = await this.getByIdOrThrow(params.id);
    void this.recordActivity(params, oldPolicy, newPolicy);

    return { success: true, message: 'Policy updated successfully' };
  }

  async validate(params: Params): Promise<PolicyDetailResponseType> {
    const existing = await this.policyDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Policy not found', 404);
    }

    if (params.dto.mediaIds && params.dto.mediaIds.length > 0) {
      for (const mediaId of params.dto.mediaIds) {
        const media = await this.mediaDao.getById({ id: mediaId });
        if (!media) {
          throw new ApiFieldValidationError(`mediaIds.${mediaId}`, 'Invalid media id');
        }
      }
    }

    return await this.getByIdOrThrow(params.id);
  }

  async update(id: number, dto: PolicyUpdateRequestType, tx: Prisma.TransactionClient): Promise<void> {
    const updateData: Prisma.PolicyUpdateInput = {
      updatedAt: new Date(),
      title: dto.title,
      content: dto.content,
    };
    await this.policyDao.update({ id, data: updateData, tx });
  }

  async linkMediasToPolicy(params: { policyId: number; mediaIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    await this.policyHasMediaDao.deleteManyByPolicyId({ policyId: params.policyId, tx: params.tx });

    for (const mediaId of params.mediaIds) {
      await this.policyHasMediaDao.create({
        data: {
          policy: { connect: { id: params.policyId } },
          media: { connect: { id: mediaId } },
        },
        tx: params.tx,
      });
    }
  }

  private async recordActivity(params: Params, oldPolicy: PolicyDetailResponseType, newPolicy: PolicyDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: { title: oldPolicy.title, content: oldPolicy.content },
      newValues: { title: newPolicy.title, content: newPolicy.content },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.policy, entityId: newPolicy.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Policy updated',
      data: { changes },
      relatedEntities,
    });
  }
}
