import { Injectable } from '@nestjs/common';
import type { AnnouncementDetailResponseType } from '@repo/dto';
import { AnnouncementDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseAnnouncementUc } from './_base-announcement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class AnnouncementGetUc extends BaseAnnouncementUc implements IUseCase<Params, AnnouncementDetailResponseType> {
  public constructor(prisma: PrismaService, logger: CommonLoggerService, announcementDao: AnnouncementDao) {
    super(prisma, logger, announcementDao);
  }

  public async execute(params: Params): Promise<AnnouncementDetailResponseType> {
    this.logger.i('Getting announcement', { id: params.id });
    return await this.getAnnouncementById(params.id, params.currentUser.organizationId);
  }
}
