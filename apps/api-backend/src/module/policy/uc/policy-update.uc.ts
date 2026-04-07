import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  MediaTypeDtoEnum,
  OperationStatusResponseType,
  PolicyDetailResponseType,
  PolicyUpdateRequestType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PolicyDao, PolicyHasMediaDao, PrismaService } from '@repo/nest-lib';
import { ApiError, ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BasePolicyUc } from './_base-policy.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: PolicyUpdateRequestType;
};

@Injectable()
export class PolicyUpdateUc extends BasePolicyUc implements IUseCase<Params, OperationStatusResponseType> {
  public constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    policyDao: PolicyDao,
    s3Service: S3Service,
    private readonly policyHasMediaDao: PolicyHasMediaDao,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, policyDao, s3Service);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating policy', { id: params.id });
    const oldPolicy = await this.validate(params);

    const processedContent = await this.processContentImages({ content: params.dto.content, policyId: params.id });
    const dtoWithProcessedContent: PolicyUpdateRequestType = { ...params.dto, content: processedContent };

    await this.transaction(async (tx) => {
      await this.updatePolicy(params.id, dtoWithProcessedContent, tx, params.currentUser.organizationId);
      if (params.dto.mediaIds !== undefined) {
        await this.linkMediasToPolicy({ policyId: params.id, mediaIds: params.dto.mediaIds, tx });
      }
    });

    const newPolicy = await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
    void this.recordActivity(params, oldPolicy, newPolicy);

    return { success: true, message: 'Policy updated successfully' };
  }

  private async validate(params: Params): Promise<PolicyDetailResponseType> {
    this.assertAdmin(params.currentUser);
    const existing = await this.policyDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
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

    const oldPolicy = await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
    return oldPolicy;
  }

  private async updatePolicy(id: number, dto: PolicyUpdateRequestType, tx: Prisma.TransactionClient, organizationId: number): Promise<void> {
    const updateData: Prisma.PolicyUpdateInput = {
      updatedAt: new Date(),
      title: dto.title,
      content: dto.content as unknown as Prisma.InputJsonValue,
    };
    await this.policyDao.update({ id, organizationId, data: updateData, tx });
  }

  private async processContentImages(params: { content: PolicyUpdateRequestType['content']; policyId: number }): Promise<PolicyUpdateRequestType['content']> {
    const list = await Promise.all(
      params.content.list.map(async (item) => {
        if (item.type !== 'text' || !item.content) return item;
        const rewritten = await this.rewriteHtmlImageKeys(item.content, params.policyId);
        return { ...item, content: rewritten };
      }),
    );
    return { list };
  }

  private async rewriteHtmlImageKeys(html: string, policyId: number): Promise<string> {
    const tempKeys = new Set<string>();
    const re = /data-s3-key="(temp\/[^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) !== null) tempKeys.add(match[1]!);
    if (tempKeys.size === 0) return html;

    const replacements = new Map<string, string>();
    for (const tempKey of tempKeys) {
      const filename = tempKey.split('/').pop() ?? tempKey;
      const moved = await this.mediaService.moveTempFileAndGetKey({
        media: { key: tempKey, name: filename, type: MediaTypeDtoEnum.image },
        mediaPlacement: 'policy',
        relationId: policyId,
        isImage: true,
      });
      if (moved) replacements.set(tempKey, moved.newKey);
    }
    return html.replace(/data-s3-key="(temp\/[^"]+)"/g, (full, key: string) => {
      const newKey = replacements.get(key);
      return newKey ? `data-s3-key="${newKey}"` : full;
    });
  }

  private async linkMediasToPolicy(params: { policyId: number; mediaIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
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
