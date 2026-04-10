import { Injectable } from '@nestjs/common';
import type { DeviceFilterRequestType, DeviceResponseType, PaginatedResponseType } from '@repo/dto';
import { DeviceSortableColumns } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, DeviceDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseDeviceUc } from './_base-device.uc.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: DeviceFilterRequestType;
};

@Injectable()
export class DeviceSearchUc extends BaseDeviceUc implements IUseCase<Params, PaginatedResponseType<DeviceResponseType>> {
  public constructor(prisma: PrismaService, logger: CommonLoggerService, deviceDao: DeviceDao, s3Service: S3Service) {
    super(prisma, logger, deviceDao, s3Service);
  }

  public async execute(params: Params): Promise<PaginatedResponseType<DeviceResponseType>> {
    this.logger.i('Searching devices', { filter: params.filterDto });
    const orderBy = this.getSort(params.filterDto.sort, DeviceSortableColumns);
    const { dbRecords, totalRecords } = await this.deviceDao.search({
      filterDto: params.filterDto,
      organizationId: params.currentUser.organizationId,
      orderBy,
    });
    const results = dbRecords.map((dbRec) => this.dbToDeviceResponse(dbRec));
    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
