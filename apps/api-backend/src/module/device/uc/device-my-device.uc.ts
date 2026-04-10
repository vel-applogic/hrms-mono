import { Injectable } from '@nestjs/common';
import type { EmployeeDeviceResponseType, MediaResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, DeviceDao, DeviceListRecordType, IUseCase, PrismaService, deviceStatusDbEnumToDtoEnum, deviceTypeDbEnumToDtoEnum, mediaTypeDbEnumToDtoEnum } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseDeviceUc } from './_base-device.uc.js';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class DeviceMyDeviceUc extends BaseDeviceUc implements IUseCase<Params, EmployeeDeviceResponseType[]> {
  public constructor(prisma: PrismaService, logger: CommonLoggerService, deviceDao: DeviceDao, s3Service: S3Service) {
    super(prisma, logger, deviceDao, s3Service);
  }

  public async execute(params: Params): Promise<EmployeeDeviceResponseType[]> {
    this.logger.i('Getting my devices', { userId: params.currentUser.id });
    const devices = await this.deviceDao.getDevicesByUserId({
      userId: params.currentUser.id,
      organizationId: params.currentUser.organizationId,
    });

    const results: EmployeeDeviceResponseType[] = [];
    for (const device of devices) {
      results.push(await this.mapToEmployeeResponse(device));
    }
    return results;
  }

  private async mapToEmployeeResponse(dbRec: DeviceListRecordType): Promise<EmployeeDeviceResponseType> {
    return {
      id: dbRec.id,
      type: deviceTypeDbEnumToDtoEnum(dbRec.type),
      brand: dbRec.brand,
      model: dbRec.model,
      serialNumber: dbRec.serialNumber,
      status: deviceStatusDbEnumToDtoEnum(dbRec.status),
      config: dbRec.config ?? undefined,
    };
  }
}
