import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  OperationStatusResponseType,
  PolicyCreateRequestType,
  PolicyDetailResponseType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PolicyDao, PolicyHasMediaDao, PrismaService } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { BasePolicyUc } from './_base-policy.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: PolicyCreateRequestType;
};

@Injectable()
export class PolicyCreateUc extends BasePolicyUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    logger: CommonLoggerService,
    policyDao: PolicyDao,
    prisma: PrismaService,
    s3Service: S3Service,
    private readonly policyHasMediaDao: PolicyHasMediaDao,
    private readonly mediaDao: MediaDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, policyDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating policy', { title: params.dto.title });

    await this.validate(params);
    const createdId = await this.transaction(async (tx) => {
      const policyId = await this.create({ dto: params.dto, organizationId: params.currentUser.organizationId, tx });
      if (params.dto.mediaIds && params.dto.mediaIds.length > 0) {
        await this.linkMediasToPolicy({ policyId, mediaIds: params.dto.mediaIds, tx });
      }
      return policyId;
    });
    const policy = await this.getByIdOrThrow(createdId, params.currentUser.organizationId);
    void this.recordActivity(params, policy);
    return { success: true, message: 'Policy created successfully' };
  }

  async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);
    if (params.dto.mediaIds && params.dto.mediaIds.length > 0) {
      for (const mediaId of params.dto.mediaIds) {
        const media = await this.mediaDao.getById({ id: mediaId });
        if (!media) {
          throw new ApiFieldValidationError(`mediaIds.${mediaId}`, 'Invalid media id');
        }
      }
    }
  }

  async create(params: { dto: PolicyCreateRequestType; organizationId: number; tx: Prisma.TransactionClient }): Promise<number> {
    return await this.policyDao.create({
      data: {
        organization: { connect: { id: params.organizationId } },
        title: params.dto.title,
        content: params.dto.content,
      },
      tx: params.tx,
    });
  }

  async linkMediasToPolicy(params: { policyId: number; mediaIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
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

  private async recordActivity(params: Params, createdPolicy: PolicyDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: { title: createdPolicy.title, content: createdPolicy.content },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.policy, entityId: createdPolicy.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Policy created',
      data: { changes },
      relatedEntities,
    });
  }
}
