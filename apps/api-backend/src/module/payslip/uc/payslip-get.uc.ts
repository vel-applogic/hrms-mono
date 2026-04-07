import { Injectable } from '@nestjs/common';
import type { PayslipDetailResponseType } from '@repo/dto';
import { CommonLoggerService, ContactDao, CurrentUserType, IUseCase, OrganizationDao, OrganizationHasAddressDao, PayrollPayslipDao } from '@repo/nest-lib';
import type { PayrollPayslipWithDetailsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '../../../external-service/s3.service.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

type OrgInfo = {
  companyName: string;
  companyLogoUrl: string | null;
  companyAddress: string;
  companyPhones: string[];
  companyEmails: string[];
  companyWebsites: string[];
  currencySymbol: string | null;
  currencyCode: string;
};

@Injectable()
export class PayslipGetUc implements IUseCase<Params, PayslipDetailResponseType> {
  public constructor(
    private readonly logger: CommonLoggerService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly organizationDao: OrganizationDao,
    private readonly organizationHasAddressDao: OrganizationHasAddressDao,
    private readonly contactDao: ContactDao,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(params: Params): Promise<PayslipDetailResponseType> {
    this.logger.i('Getting payslip', { id: params.id });
    await this.validate(params);
    return await this.getById(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async getById(params: Params): Promise<PayslipDetailResponseType> {
    const organizationId = params.currentUser.organizationId;

    const [payslip, orgInfo] = await Promise.all([
      this.payrollPayslipDao.getById({ id: params.id, organizationId }),
      this.getOrgInfo(organizationId),
    ]);
    if (!payslip) {
      throw new ApiError('Payslip not found', 404);
    }

    const pdfSignedUrl = payslip.pdfS3Key ? await this.s3Service.getSignedUrl(payslip.pdfS3Key) : null;

    return this.mapToDetail(payslip, pdfSignedUrl, orgInfo);
  }

  private async getOrgInfo(organizationId: number): Promise<OrgInfo> {
    const [org, addressLinks, contacts] = await Promise.all([
      this.organizationDao.getByIdWithLogoOrThrow({ id: organizationId }),
      this.organizationHasAddressDao.findByOrganizationId({ organizationId }),
      this.contactDao.findByOrganizationId({ organizationId }),
    ]);

    const companyLogoUrl = org.logo ? await this.s3Service.getSignedUrl(org.logo.key) : null;

    let companyAddress = '';
    if (addressLinks.length > 0) {
      const addr = addressLinks[0].address;
      const parts = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.postalCode, addr.country.name].filter((p) => p?.length);
      companyAddress = parts.join(', ');
    }

    return {
      companyName: org.name,
      companyLogoUrl,
      companyAddress,
      companyPhones: contacts.filter((c) => c.contactType === 'phone').map((c) => c.contact),
      companyEmails: contacts.filter((c) => c.contactType === 'email').map((c) => c.contact),
      companyWebsites: contacts.filter((c) => c.contactType === 'website').map((c) => c.contact),
      currencySymbol: org.currency.symbol,
      currencyCode: org.currency.code,
    };
  }

  private mapToDetail(p: PayrollPayslipWithDetailsType, pdfSignedUrl: string | null, orgInfo: OrgInfo): PayslipDetailResponseType {
    return {
      id: p.id,
      employeeId: p.userId,
      employeeFirstname: p.user.firstname,
      employeeLastname: p.user.lastname,
      employeeEmail: p.user.email,
      employeeDesignation: p.user.employees?.[0]?.designation ?? '',
      companyName: orgInfo.companyName,
      companyLogoUrl: orgInfo.companyLogoUrl,
      companyAddress: orgInfo.companyAddress,
      companyPhones: orgInfo.companyPhones,
      companyEmails: orgInfo.companyEmails,
      companyWebsites: orgInfo.companyWebsites,
      month: p.month,
      year: p.year,
      grossAmount: p.grossAmount,
      netAmount: p.netAmount,
      deductionAmount: p.deductionAmount,
      currencySymbol: orgInfo.currencySymbol,
      currencyCode: orgInfo.currencyCode,
      pdfSignedUrl,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      lineItems: p.payrollPayslipLineItems.map((li) => ({
        id: li.id,
        payslipId: li.payslipId,
        type: li.type,
        title: li.title,
        amount: li.amount,
        createdAt: li.createdAt.toISOString(),
        updatedAt: li.updatedAt.toISOString(),
      })),
    };
  }
}
