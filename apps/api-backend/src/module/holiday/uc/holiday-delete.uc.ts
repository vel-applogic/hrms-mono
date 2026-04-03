import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, HolidayDao, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class HolidayDeleteUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly holidayDao: HolidayDao,
  ) {}

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting holiday', { id: params.id });

    try {
      await this.holidayDao.getByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId });
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Holiday not found');
      }
      throw error;
    }

    await this.prisma.$transaction(async (tx) => {
      await this.holidayDao.deleteByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId, tx });
    });

    return { success: true };
  }
}
