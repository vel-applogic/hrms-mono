import { Injectable } from '@nestjs/common';
import type { EmployeeDeviceResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, DeviceDao, DeviceListRecordType, IUseCase, PrismaService, deviceStatusDbEnumToDtoEnum, deviceTypeDbEnumToDtoEnum } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseDeviceUc } from './_base-device.uc.js';

type Params = {
  currentUser: CurrentUserType;
  userId: number;
};

@Injectable()
export class DeviceUserDeviceUc extends BaseDeviceUc implements IUseCase<Params, EmployeeDeviceResponseType[]> {
  public constructor(prisma: PrismaService, logger: CommonLoggerService, deviceDao: DeviceDao, s3Service: S3Service) {
    super(prisma, logger, deviceDao, s3Service);
  }

  public async execute(params: Params): Promise<EmployeeDeviceResponseType[]> {
    this.logger.i('Getting user devices', { userId: params.userId });
    this.assertAdmin(params.currentUser);

    const devices = await this.deviceDao.getDevicesByUserId({
      userId: params.userId,
      organizationId: params.currentUser.organizationId,
    });

    return devices.map((dbRec) => ({
      id: dbRec.id,
      type: deviceTypeDbEnumToDtoEnum(dbRec.type),
      brand: dbRec.brand,
      model: dbRec.model,
      serialNumber: dbRec.serialNumber,
      status: deviceStatusDbEnumToDtoEnum(dbRec.status),
      config: dbRec.config ?? undefined,
    }));
  }
}
