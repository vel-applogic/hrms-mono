import { Injectable } from '@nestjs/common';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  DeviceCreateRequestType,
  DeviceMediaUpsertType,
  DeviceResponseType,
  MediaTypeDtoEnum,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, DeviceDao, DeviceHasMediaDao, DevicePossessionHistoryDao, IUseCase, MediaDao, PrismaService, deviceStatusDtoEnumToDbEnum, deviceTypeDtoEnumToDbEnum } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseDeviceUc } from './_base-device.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: DeviceCreateRequestType;
};

@Injectable()
export class DeviceCreateUc extends BaseDeviceUc implements IUseCase<Params, DeviceResponseType> {
  public constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    deviceDao: DeviceDao,
    s3Service: S3Service,
    private readonly deviceHasMediaDao: DeviceHasMediaDao,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly auditService: AuditService,
    private readonly possessionHistoryDao: DevicePossessionHistoryDao,
  ) {
    super(prisma, logger, deviceDao, s3Service);
  }

  public async execute(params: Params): Promise<DeviceResponseType> {
    this.logger.i('Creating device', { model: params.dto.model });
    await this.validate(params);

    const createdId = await this.transaction(async (tx) => {
      const deviceId = await this.deviceDao.create({
        data: {
          organization: { connect: { id: params.currentUser.organizationId } },
          type: deviceTypeDtoEnumToDbEnum(params.dto.type),
          brand: params.dto.brand,
          model: params.dto.model,
          serialNumber: params.dto.serialNumber,
          price: params.dto.price,
          purchasedAt: params.dto.purchasedAt ? new Date(params.dto.purchasedAt) : undefined,
          warrantyExpiresAt: new Date(params.dto.warrantyExpiresAt),
          inWarranty: params.dto.inWarranty ?? true,
          status: deviceStatusDtoEnumToDbEnum(params.dto.status),
          config: params.dto.config,
          assignedTo: params.dto.assignedToId ? { connect: { id: params.dto.assignedToId } } : undefined,
        },
        tx,
      });

      // Handle media uploads
      if (params.dto.medias && params.dto.medias.length > 0) {
        for (const mediaItem of params.dto.medias) {
          const mediaId = await this.processAndCreateMedia(mediaItem, deviceId, params.currentUser.organizationId, tx);
          await this.deviceHasMediaDao.create({
            data: {
              device: { connect: { id: deviceId } },
              media: { connect: { id: mediaId } },
              caption: mediaItem.caption,
            },
            tx,
          });
        }
      }

      // Create possession history if assigned
      if (params.dto.assignedToId) {
        await this.possessionHistoryDao.create({
          data: {
            organization: { connect: { id: params.currentUser.organizationId } },
            user: { connect: { id: params.dto.assignedToId } },
            device: { connect: { id: deviceId } },
            fromDate: new Date(),
            notes: [],
          },
          tx,
        });
      }

      return deviceId;
    });

    const device = await this.getDeviceResponseById(createdId, params.currentUser.organizationId);
    void this.recordActivity(params, device);
    return device;
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);
  }

  private async processAndCreateMedia(
    mediaItem: DeviceMediaUpsertType,
    deviceId: number,
    organizationId: number,
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
  ): Promise<number> {
    if (mediaItem.id) {
      return mediaItem.id;
    }

    const moved = await this.mediaService.moveTempFileAndGetKey({
      media: { key: mediaItem.key, name: mediaItem.name, type: mediaItem.type },
      mediaPlacement: 'device',
      relationId: deviceId,
      isImage: mediaItem.type === MediaTypeDtoEnum.image,
    });

    if (!moved) {
      throw new Error('Failed to process media file');
    }

    return await this.mediaDao.create({
      data: {
        key: moved.newKey,
        name: mediaItem.name,
        type: mediaItem.type,
        size: moved.size,
        ext: moved.ext,
        organization: { connect: { id: organizationId } },
      },
      tx,
    });
  }

  private async recordActivity(params: Params, device: DeviceResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: { brand: device.brand, model: device.model, serialNumber: device.serialNumber, type: device.type, status: device.status },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Device ${device.brand} ${device.model} created`,
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.device, entityId: device.id }],
    });
  }
}
