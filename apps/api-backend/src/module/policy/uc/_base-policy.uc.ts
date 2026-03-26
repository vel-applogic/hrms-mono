import { MediaResponseType, PolicyDetailResponseType, PolicyListResponseType } from '@repo/dto';
import { PolicyListRecordType } from '@repo/nest-lib';
import { BaseUc, CommonLoggerService, PolicyDao, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

export class BasePolicyUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly policyDao: PolicyDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  async getById(id: number, organizationId: number): Promise<PolicyDetailResponseType | undefined> {
    const policy = await this.policyDao.getById({ id, organizationId });
    if (!policy) {
      return undefined;
    }

    const medias: MediaResponseType[] = [];
    for (const phm of policy.policyHasMedias ?? []) {
      const urlFull = await this.s3Service.getSignedUrl(phm.media.key);
      medias.push({
        id: phm.media.id,
        name: phm.media.name,
        key: phm.media.key,
        urlFull,
        type: phm.media.type as MediaResponseType['type'],
        size: phm.media.size,
        ext: phm.media.ext,
      });
    }

    return {
      id: policy.id,
      title: policy.title,
      content: JSON.stringify(policy.content),
      medias: medias.length > 0 ? medias : undefined,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
    };
  }

  protected dbToPolicyListResponse(dbRec: PolicyListRecordType): PolicyListResponseType {
    return {
      id: dbRec.id,
      title: dbRec.title,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  async getByIdOrThrow(id: number, organizationId: number): Promise<PolicyDetailResponseType> {
    const policy = await this.getById(id, organizationId);
    if (!policy) {
      throw new ApiError('Policy not found', 404);
    }
    return policy;
  }
}
