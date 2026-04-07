import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  OperationStatusResponseType,
  PolicyDetailResponseType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PolicyDao, PolicyHasMediaDao, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BasePolicyUc } from './_base-policy.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class PolicyDeleteUc extends BasePolicyUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    policyDao: PolicyDao,
    s3Service: S3Service,
    private readonly policyHasMediaDao: PolicyHasMediaDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, policyDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting policy', { id: params.id });

    const policy = await this.validate(params);

    this.transaction(async (tx) => {
      await this.removeMedias({ policyId: params.id, tx });
      await this.delete({ id: params.id, organizationId: params.currentUser.organizationId, tx });
    });
    void this.recordActivity(params, policy);

    return { success: true, message: 'Policy deleted successfully' };
  }

  async validate(params: Params): Promise<PolicyDetailResponseType> {
    this.assertAdmin(params.currentUser);
    return await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
  }

  async removeMedias(params: { policyId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.policyHasMediaDao.deleteManyByPolicyId({ policyId: params.policyId, tx: params.tx });
  }

  async delete(params: { id: number; organizationId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.policyDao.deleteByIdOrThrow({ id: params.id, organizationId: params.organizationId, tx: params.tx });
  }

  private async recordActivity(params: Params, deletedPolicy: PolicyDetailResponseType): Promise<void> {
    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.policy, entityId: deletedPolicy.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Policy ${deletedPolicy.id} deleted`,
      relatedEntities,
    });
  }
}
