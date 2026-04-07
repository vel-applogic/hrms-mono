import { Injectable } from '@nestjs/common';
import type { PayslipFilterRequestType, PayslipListResponseType, PaginatedResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, OrganizationDao, PayrollPayslipDao } from '@repo/nest-lib';
import type { PayrollPayslipWithUserType } from '@repo/nest-lib';

import { S3Service } from '../../../external-service/s3.service.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: PayslipFilterRequestType;
};

@Injectable()
export class PayslipListUc implements IUseCase<Params, PaginatedResponseType<PayslipListResponseType>> {
  public constructor(
    private readonly logger: CommonLoggerService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly organizationDao: OrganizationDao,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(params: Params): Promise<PaginatedResponseType<PayslipListResponseType>> {
    this.logger.i('Listing payslips', { month: params.filterDto.month, year: params.filterDto.year });
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async search(params: Params): Promise<PaginatedResponseType<PayslipListResponseType>> {
    const [{ dbRecords, totalRecords }, org] = await Promise.all([
      this.payrollPayslipDao.findWithPagination({
        page: params.filterDto.pagination.page,
        limit: params.filterDto.pagination.limit,
        month: params.filterDto.month,
        year: params.filterDto.year,
        employeeIds: params.filterDto.employeeIds,
        organizationId: params.currentUser.organizationId,
      }),
      this.organizationDao.getByIdOrThrow({ id: params.currentUser.organizationId }),
    ]);

    const currency = { symbol: org.currency.symbol, code: org.currency.code };

    const signedUrls = await Promise.all(
      dbRecords.map((p: PayrollPayslipWithUserType) => (p.pdfS3Key ? this.s3Service.getSignedUrl(p.pdfS3Key) : Promise.resolve(null))),
    );

    const results: PayslipListResponseType[] = dbRecords.map((p: PayrollPayslipWithUserType, i: number) => ({
      id: p.id,
      employeeId: p.userId,
      employeeFirstname: p.user.firstname,
      employeeLastname: p.user.lastname,
      employeeEmail: p.user.email,
      month: p.month,
      year: p.year,
      grossAmount: p.grossAmount,
      netAmount: p.netAmount,
      deductionAmount: p.deductionAmount,
      currencySymbol: currency.symbol,
      currencyCode: currency.code,
      pdfSignedUrl: signedUrls[i],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
