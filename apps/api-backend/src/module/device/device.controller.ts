import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  DeviceCreateRequestType,
  DeviceDetailResponseType,
  DeviceFilterRequestType,
  DeviceResponseType,
  DeviceUpdateRequestType,
  EmployeeDeviceResponseType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { DeviceCreateRequestSchema, DeviceFilterRequestSchema, DeviceUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { DeviceCreateUc } from './uc/device-create.uc.js';
import { DeviceDeleteUc } from './uc/device-delete.uc.js';
import { DeviceGetUc } from './uc/device-get.uc.js';
import { DeviceMyDeviceUc } from './uc/device-my-device.uc.js';
import { DeviceSearchUc } from './uc/device-search.uc.js';
import { DeviceUpdateUc } from './uc/device-update.uc.js';
import { DeviceUserDeviceUc } from './uc/device-user-device.uc.js';

@Controller('api/device')
export class DeviceController {
  constructor(
    private readonly searchUc: DeviceSearchUc,
    private readonly getUc: DeviceGetUc,
    private readonly createUc: DeviceCreateUc,
    private readonly updateUc: DeviceUpdateUc,
    private readonly deleteUc: DeviceDeleteUc,
    private readonly myDeviceUc: DeviceMyDeviceUc,
    private readonly userDeviceUc: DeviceUserDeviceUc,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(DeviceCreateRequestSchema)) body: DeviceCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<DeviceResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(DeviceFilterRequestSchema)) filterDto: DeviceFilterRequestType,
  ): Promise<PaginatedResponseType<DeviceResponseType>> {
    return this.searchUc.execute({ currentUser, filterDto });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(DeviceUpdateRequestSchema)) body: DeviceUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<DeviceResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Get('/my-device')
  async myDevices(@CurrentUser() currentUser: CurrentUserType): Promise<EmployeeDeviceResponseType[]> {
    return this.myDeviceUc.execute({ currentUser });
  }

  @Get('/user/:userId')
  async userDevices(@Param('userId', ParseIntPipe) userId: number, @CurrentUser() currentUser: CurrentUserType): Promise<EmployeeDeviceResponseType[]> {
    return this.userDeviceUc.execute({ currentUser, userId });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<DeviceDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
