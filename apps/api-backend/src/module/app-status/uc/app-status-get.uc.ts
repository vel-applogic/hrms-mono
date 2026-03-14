import { Injectable } from '@nestjs/common';
import type { AppStatusType } from '@repo/dto';

@Injectable()
export class AppStatusGetUc {
  async execute(): Promise<AppStatusType> {
    return {
      service: 'api-admin',
      status: true,
      msg: ['up'],
    };
  }
}
