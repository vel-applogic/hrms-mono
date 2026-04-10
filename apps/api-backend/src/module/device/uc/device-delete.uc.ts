import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  DeviceDetailResponseType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, DeviceDao, DeviceHasMediaDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseDeviceUc } from './_base-device.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class DeviceDeleteUc extends BaseDeviceUc implements IUseCase<Params, OperationStatusResponseType> {
  public constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    deviceDao: DeviceDao,
    s3Service: S3Service,
    private readonly deviceHasMediaDao: DeviceHasMediaDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, deviceDao, s3Service);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting device', { id: params.id });
    const device = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.deviceHasMediaDao.deleteManyByDeviceId({ deviceId: params.id, tx });
      await this.deletePossessionHistories(params.id, tx);
      await this.deviceDao.deleteByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId, tx });
    });

    void this.recordActivity(params, device);
    return { success: true, message: 'Device deleted successfully' };
  }

  private async validate(params: Params): Promise<DeviceDetailResponseType> {
    this.assertAdmin(params.currentUser);
    return await this.getDeviceById(params.id, params.currentUser.organizationId);
  }

  private async deletePossessionHistories(deviceId: number, tx: Prisma.TransactionClient): Promise<void> {
    await tx.devicePossessionHistory.deleteMany({ where: { deviceId } });
  }

  private async recordActivity(params: Params, device: DeviceDetailResponseType): Promise<void> {
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Device ${device.brand} ${device.model} deleted`,
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.device, entityId: device.id }],
    });
  }
}
