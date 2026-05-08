import { Injectable } from '@nestjs/common';
import type { CountryResponseType } from '@repo/dto';
import { CommonLoggerService, CountryDao, IUseCase } from '@repo/nest-lib';
import type { CountrySelectTableRecordType } from '@repo/nest-lib';

type Params = Record<string, never>;

@Injectable()
export class CountryListUc implements IUseCase<Params, CountryResponseType[]> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly countryDao: CountryDao,
  ) {}

  public async execute(): Promise<CountryResponseType[]> {
    this.logger.i('Listing countries');
    await this.validate();
    return await this.search();
  }

  private async validate(): Promise<void> {
    // No validation required
  }

  private async search(): Promise<CountryResponseType[]> {
    const dbRecords = await this.countryDao.findAll();
    return dbRecords.map((r: CountrySelectTableRecordType) => ({
      id: r.id,
      name: r.name,
      code: r.code,
    }));
  }
}
