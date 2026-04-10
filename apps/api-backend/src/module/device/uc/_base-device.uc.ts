import type { DeviceDetailResponseType, DeviceMediaResponseType, DeviceResponseType, MediaResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, DeviceDao, DeviceDetailRecordType, DeviceListRecordType, PrismaService, deviceStatusDbEnumToDtoEnum, deviceTypeDbEnumToDtoEnum, mediaTypeDbEnumToDtoEnum } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

export class BaseDeviceUc extends BaseUc {
  public constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly deviceDao: DeviceDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  protected dbToDeviceResponse(dbRec: DeviceListRecordType): DeviceResponseType {
    return {
      id: dbRec.id,
      type: deviceTypeDbEnumToDtoEnum(dbRec.type),
      brand: dbRec.brand,
      model: dbRec.model,
      serialNumber: dbRec.serialNumber,
      price: dbRec.price,
      purchasedAt: dbRec.purchasedAt?.toISOString(),
      warrantyExpiresAt: dbRec.warrantyExpiresAt.toISOString(),
      inWarranty: dbRec.inWarranty,
      status: deviceStatusDbEnumToDtoEnum(dbRec.status),
      config: dbRec.config ?? undefined,
      assignedToId: dbRec.assignedToId ?? undefined,
      assignedTo: dbRec.assignedTo
        ? { id: dbRec.assignedTo.id, firstname: dbRec.assignedTo.firstname, lastname: dbRec.assignedTo.lastname }
        : undefined,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async dbToDeviceDetailResponse(dbRec: DeviceDetailRecordType): Promise<DeviceDetailResponseType> {
    const medias: DeviceMediaResponseType[] = [];
    for (const dhm of dbRec.deviceHasMedias ?? []) {
      const urlFull = await this.s3Service.getSignedUrl(dhm.media.key);
      medias.push({
        id: dhm.media.id,
        name: dhm.media.name,
        key: dhm.media.key,
        urlFull,
        type: mediaTypeDbEnumToDtoEnum(dhm.media.type) as MediaResponseType['type'],
        size: dhm.media.size,
        ext: dhm.media.ext,
        caption: dhm.caption ?? undefined,
      });
    }

    const possessionHistories = (dbRec.possessionHistories ?? []).map((ph) => ({
      id: ph.id,
      userId: ph.user.id,
      firstname: ph.user.firstname,
      lastname: ph.user.lastname,
      fromDate: ph.fromDate.toISOString(),
      toDate: ph.toDate?.toISOString(),
      notes: ph.notes,
    }));

    return {
      ...this.dbToDeviceResponse(dbRec),
      medias: medias.length > 0 ? medias : undefined,
      possessionHistories: possessionHistories.length > 0 ? possessionHistories : undefined,
    };
  }

  protected async getDeviceById(id: number, organizationId: number): Promise<DeviceDetailResponseType> {
    try {
      const dbRec = await this.deviceDao.getByIdOrThrow({ id, organizationId });
      return await this.dbToDeviceDetailResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Device not found');
      }
      throw error;
    }
  }

  protected async getDeviceResponseById(id: number, organizationId: number): Promise<DeviceResponseType> {
    try {
      const dbRec = await this.deviceDao.getByIdOrThrow({ id, organizationId });
      return this.dbToDeviceResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Device not found');
      }
      throw error;
    }
  }
}
