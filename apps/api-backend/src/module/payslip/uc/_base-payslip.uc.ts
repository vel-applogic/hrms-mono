import { PayslipListResponseType } from '@repo/dto';
import type { PayrollPayslipWithUserType } from '@repo/nest-lib';
import { BaseUc, PrismaService } from '@repo/nest-lib';
import { CommonLoggerService } from '@repo/nest-lib';

export type CurrencyInfo = {
  symbol: string | null;
  code: string;
};

export class BasePayslipUc extends BaseUc {
  constructor(prisma: PrismaService, logger: CommonLoggerService) {
    super(prisma, logger);
  }

  protected dbToPayslipListResponse(dbRec: PayrollPayslipWithUserType, currency: CurrencyInfo): PayslipListResponseType {
    return {
      id: dbRec.id,
      employeeId: dbRec.userId,
      employeeFirstname: dbRec.user.firstname,
      employeeLastname: dbRec.user.lastname,
      employeeEmail: dbRec.user.email,
      month: dbRec.month,
      year: dbRec.year,
      grossAmount: dbRec.grossAmount,
      netAmount: dbRec.netAmount,
      deductionAmount: dbRec.deductionAmount,
      currencySymbol: currency.symbol,
      currencyCode: currency.code,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }
}
