import { Injectable } from '@nestjs/common';
import type { HolidayResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, HolidayDao, HolidaySelectTableRecordType, holidayTypeDbEnumToDtoEnum, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

@Injectable()
export class BaseHolidayUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly holidayDao: HolidayDao,
  ) {
    super(prisma, logger);
  }

  protected dbToHolidayResponse(dbRec: HolidaySelectTableRecordType): HolidayResponseType {
    return {
      id: dbRec.id,
      name: dbRec.name,
      date: dbRec.date.toISOString().split('T')[0]!,
      types: dbRec.types.map((t) => holidayTypeDbEnumToDtoEnum(t)),
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async getHolidayResponseById(id: number, organizationId: number): Promise<HolidayResponseType> {
    try {
      const dbRec = await this.holidayDao.getByIdOrThrow({ id, organizationId });
      return this.dbToHolidayResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Holiday not found');
      }
      throw error;
    }
  }
}
