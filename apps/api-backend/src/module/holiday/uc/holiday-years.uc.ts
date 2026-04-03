import { Injectable } from '@nestjs/common';
import { CommonLoggerService, CurrentUserType, HolidayDao, IUseCase } from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class HolidayYearsUc implements IUseCase<Params, number[]> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly holidayDao: HolidayDao,
  ) {}

  async execute(params: Params): Promise<number[]> {
    this.logger.i('Getting distinct holiday years');
    return this.holidayDao.getDistinctYears({ organizationId: params.currentUser.organizationId });
  }
}
