import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { HolidayCreateRequestType, HolidayResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, HolidayDao, holidayTypeDtoEnumToDbEnum, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseHolidayUseCase } from './_base-holiday.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: HolidayCreateRequestType;
};

@Injectable()
export class HolidayCreateUc extends BaseHolidayUseCase implements IUseCase<Params, HolidayResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, holidayDao: HolidayDao) {
    super(prisma, logger, holidayDao);
  }

  public async execute(params: Params): Promise<HolidayResponseType> {
    this.logger.i('Creating holiday', { name: params.dto.name });
    await this.validate(params);

    const createdId = await this.prisma.$transaction(async (tx) => {
      return await this.create(params, tx);
    });

    return await this.getHolidayResponseById(createdId, params.currentUser.organizationId);
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);
  }

  private async create(params: Params, tx: Prisma.TransactionClient): Promise<number> {
    return await this.holidayDao.create({
      data: {
        name: params.dto.name,
        date: new Date(params.dto.date),
        types: params.dto.types.map((t) => holidayTypeDtoEnumToDbEnum(t)),
        organization: { connect: { id: params.currentUser.organizationId } },
      },
      tx,
    });
  }
}
