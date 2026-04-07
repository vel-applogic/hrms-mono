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

  public async execute(params: Params): Promise<number[]> {
    this.logger.i('Getting distinct holiday years');
    await this.validate(params);
    return await this.years(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async years(params: Params): Promise<number[]> {
    return await this.holidayDao.getDistinctYears({ organizationId: params.currentUser.organizationId });
  }
}
