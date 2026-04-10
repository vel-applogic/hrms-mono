import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { ServiceModule } from '#src/service/service.module.js';

import { DeviceController } from './device.controller.js';
import { DeviceCreateUc } from './uc/device-create.uc.js';
import { DeviceDeleteUc } from './uc/device-delete.uc.js';
import { DeviceGetUc } from './uc/device-get.uc.js';
import { DeviceMyDeviceUc } from './uc/device-my-device.uc.js';
import { DeviceSearchUc } from './uc/device-search.uc.js';
import { DeviceUpdateUc } from './uc/device-update.uc.js';
import { DeviceUserDeviceUc } from './uc/device-user-device.uc.js';

@Module({
  imports: [ExternalServiceModule, ServiceModule],
  controllers: [DeviceController],
  providers: [DeviceSearchUc, DeviceGetUc, DeviceCreateUc, DeviceUpdateUc, DeviceDeleteUc, DeviceMyDeviceUc, DeviceUserDeviceUc],
})
export class DeviceModule {}
