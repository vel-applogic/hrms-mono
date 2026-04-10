import { Injectable } from '@nestjs/common';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  DeviceMediaUpsertType,
  DeviceResponseType,
  DeviceUpdateRequestType,
  MediaTypeDtoEnum,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, DeviceDao, DeviceHasMediaDao, DevicePossessionHistoryDao, IUseCase, MediaDao, PrismaService, deviceStatusDtoEnumToDbEnum, deviceTypeDtoEnumToDbEnum } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';
import { deviceStatusDtoEnumToReadableLabel, deviceTypeDtoEnumToReadableLabel } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseDeviceUc } from './_base-device.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: DeviceUpdateRequestType;
};

@Injectable()
export class DeviceUpdateUc extends BaseDeviceUc implements IUseCase<Params, DeviceResponseType> {
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
    this.logger.i('Updating device', { id: params.id });
    const { oldDevice, oldAssignedToId } = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.deviceDao.update({
        id: params.id,
        organizationId: params.currentUser.organizationId,
        data: {
          type: deviceTypeDtoEnumToDbEnum(params.dto.type),
          brand: params.dto.brand,
          model: params.dto.model,
          serialNumber: params.dto.serialNumber,
          price: params.dto.price,
          purchasedAt: params.dto.purchasedAt ? new Date(params.dto.purchasedAt) : null,
          warrantyExpiresAt: new Date(params.dto.warrantyExpiresAt),
          inWarranty: params.dto.inWarranty ?? true,
          status: deviceStatusDtoEnumToDbEnum(params.dto.status),
          config: params.dto.config ?? null,
          assignedTo: params.dto.assignedToId ? { connect: { id: params.dto.assignedToId } } : { disconnect: true },
          updatedAt: new Date(),
        },
        tx,
      });

      // Handle media
      if (params.dto.medias !== undefined) {
        await this.deviceHasMediaDao.deleteManyByDeviceId({ deviceId: params.id, tx });
        if (params.dto.medias && params.dto.medias.length > 0) {
          for (const mediaItem of params.dto.medias) {
            const mediaId = await this.processAndCreateMedia(mediaItem, params.id, params.currentUser.organizationId, tx);
            await this.deviceHasMediaDao.create({
              data: {
                device: { connect: { id: params.id } },
                media: { connect: { id: mediaId } },
                caption: mediaItem.caption,
              },
              tx,
            });
          }
        }
      }

      // Handle possession history when assignedTo changes
      const newAssignedToId = params.dto.assignedToId ?? null;
      if (oldAssignedToId !== newAssignedToId) {
        // Close any open possession record
        if (oldAssignedToId) {
          await this.possessionHistoryDao.closeOpenRecord({
            deviceId: params.id,
            toDate: new Date(),
            tx,
          });
        }
        // Create new possession record if newly assigned
        if (newAssignedToId) {
          await this.possessionHistoryDao.create({
            data: {
              organization: { connect: { id: params.currentUser.organizationId } },
              user: { connect: { id: newAssignedToId } },
              device: { connect: { id: params.id } },
              fromDate: new Date(),
              notes: [],
            },
            tx,
          });
        }
      }
    });

    const updatedDevice = await this.getDeviceResponseById(params.id, params.currentUser.organizationId);
    void this.recordActivity(params, oldDevice, updatedDevice);
    return updatedDevice;
  }

  private async validate(params: Params): Promise<{ oldDevice: DeviceResponseType; oldAssignedToId: number | null }> {
    this.assertAdmin(params.currentUser);
    let dbRec;
    try {
      dbRec = await this.deviceDao.getByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId });
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Device not found');
      }
      throw error;
    }

    const oldDevice = this.dbToDeviceResponse(dbRec);
    return { oldDevice, oldAssignedToId: dbRec.assignedToId };
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

  private async recordActivity(params: Params, oldDevice: DeviceResponseType, newDevice: DeviceResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        brand: oldDevice.brand,
        model: oldDevice.model,
        serialNumber: oldDevice.serialNumber,
        type: deviceTypeDtoEnumToReadableLabel(oldDevice.type),
        status: deviceStatusDtoEnumToReadableLabel(oldDevice.status),
        price: oldDevice.price,
        inWarranty: oldDevice.inWarranty,
      },
      newValues: {
        brand: newDevice.brand,
        model: newDevice.model,
        serialNumber: newDevice.serialNumber,
        type: deviceTypeDtoEnumToReadableLabel(newDevice.type),
        status: deviceStatusDtoEnumToReadableLabel(newDevice.status),
        price: newDevice.price,
        inWarranty: newDevice.inWarranty,
      },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Device ${newDevice.brand} ${newDevice.model} updated`,
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.device, entityId: newDevice.id }],
    });
  }
}
