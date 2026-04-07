import { Injectable } from '@nestjs/common';
import type { CurrencyResponseType } from '@repo/dto';
import { CommonLoggerService, CurrencyDao, IUseCase } from '@repo/nest-lib';
import type { CurrencySelectTableRecordType } from '@repo/nest-lib';

type Params = Record<string, never>;

@Injectable()
export class CurrencyListUc implements IUseCase<Params, CurrencyResponseType[]> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly currencyDao: CurrencyDao,
  ) {}

  public async execute(): Promise<CurrencyResponseType[]> {
    this.logger.i('Listing currencies');
    await this.validate();
    return await this.search();
  }

  private async validate(): Promise<void> {
    // No validation required
  }

  private async search(): Promise<CurrencyResponseType[]> {
    const dbRecords = await this.currencyDao.findAll();
    return dbRecords.map((r: CurrencySelectTableRecordType) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      symbol: r.symbol,
    }));
  }
}
