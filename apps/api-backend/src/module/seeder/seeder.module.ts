import { Module } from '@nestjs/common';
import { CommonDbModule, CommonLoggerService } from '@repo/nest-lib';

import { PasswordService } from '../../service/password.service.js';

import { Seeder } from './seeder.js';

@Module({
  imports: [CommonDbModule],
  providers: [Seeder, PasswordService, CommonLoggerService],
})
export class SeederModule {}
