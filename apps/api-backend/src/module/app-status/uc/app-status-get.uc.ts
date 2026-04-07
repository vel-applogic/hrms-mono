import { Injectable } from '@nestjs/common';
import type { AppStatusType } from '@repo/dto';

type Params = Record<string, never>;

@Injectable()
export class AppStatusGetUc {
  public async execute(): Promise<AppStatusType> {
    await this.validate({});
    return await this.getStatus();
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async getStatus(): Promise<AppStatusType> {
    return {
      service: 'api-admin',
      status: true,
      msg: ['up'],
    };
  }
}
