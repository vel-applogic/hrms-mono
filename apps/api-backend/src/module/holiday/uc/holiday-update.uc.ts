import { Injectable } from '@nestjs/common';
import type { HolidayUpdateRequestType, HolidayResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, HolidayDao, holidayTypeDtoEnumToDbEnum, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { BaseHolidayUseCase } from './_base-holiday.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: HolidayUpdateRequestType;
};

@Injectable()
export class HolidayUpdateUc extends BaseHolidayUseCase implements IUseCase<Params, HolidayResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, holidayDao: HolidayDao) {
    super(prisma, logger, holidayDao);
  }

  async execute(params: Params): Promise<HolidayResponseType> {
    this.logger.i('Updating holiday', { id: params.id });

    try {
      await this.holidayDao.getByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId });
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Holiday not found');
      }
      throw error;
    }

    await this.prisma.$transaction(async (tx) => {
      await this.holidayDao.update({
        id: params.id,
        data: {
          name: params.dto.name,
          date: new Date(params.dto.date),
          types: params.dto.types.map((t) => holidayTypeDtoEnumToDbEnum(t)),
        },
        tx,
      });
    });

    return await this.getHolidayResponseById(params.id, params.currentUser.organizationId);
  }
}
