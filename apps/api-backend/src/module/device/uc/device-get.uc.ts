import { Injectable } from '@nestjs/common';
import type { DeviceDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, DeviceDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseDeviceUc } from './_base-device.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class DeviceGetUc extends BaseDeviceUc implements IUseCase<Params, DeviceDetailResponseType> {
  public constructor(prisma: PrismaService, logger: CommonLoggerService, deviceDao: DeviceDao, s3Service: S3Service) {
    super(prisma, logger, deviceDao, s3Service);
  }

  public async execute(params: Params): Promise<DeviceDetailResponseType> {
    this.logger.i('Getting device', { id: params.id });
    return await this.getDeviceById(params.id, params.currentUser.organizationId);
  }
}
