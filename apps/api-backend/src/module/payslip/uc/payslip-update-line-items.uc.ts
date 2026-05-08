import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { PayslipDetailResponseType, PayslipUpdateLineItemsRequestType } from '@repo/dto';
import { BaseUc, CommonLoggerService, ContactDao, CurrentUserType, IUseCase, OrganisationDao, OrganisationHasAddressDao, PayrollPayslipDao, PrismaService } from '@repo/nest-lib';
import type { PayrollPayslipWithDetailsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '../../../external-service/s3.service.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: PayslipUpdateLineItemsRequestType;
};

@Injectable()
export class PayslipUpdateLineItemsUc extends BaseUc implements IUseCase<Params, PayslipDetailResponseType> {
  public constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly organisationDao: OrganisationDao,
    private readonly organisationHasAddressDao: OrganisationHasAddressDao,
    private readonly contactDao: ContactDao,
    private readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<PayslipDetailResponseType> {
    this.logger.i('Updating payslip line items', { id: params.id });
    await this.validate(params);

    const updated = await this.prisma.$transaction(async (tx) => {
      return await this.replaceLineItems(params, tx);
    });

    if (!updated) {
      throw new ApiError('Failed to update payslip line items', 500);
    }

    return await this.buildResponse(params, updated);
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);
    const organisationId = params.currentUser.organisationId;
    const existing = await this.payrollPayslipDao.getById({ id: params.id, organisationId });
    if (!existing) {
      throw new ApiError('Payslip not found', 404);
    }
  }

  private async replaceLineItems(params: Params, tx: Prisma.TransactionClient): Promise<PayrollPayslipWithDetailsType | undefined> {
    return await this.payrollPayslipDao.replaceLineItems({
      payslipId: params.id,
      lineItems: params.dto.lineItems.map((li) => ({
        type: li.type,
        title: li.title,
        amount: li.amount,
      })),
      tx,
    });
  }

  private async buildResponse(params: Params, updated: PayrollPayslipWithDetailsType): Promise<PayslipDetailResponseType> {
    const organisationId = params.currentUser.organisationId;

    const [org, addressLinks, contacts] = await Promise.all([
      this.organisationDao.getByIdWithLogoOrThrow({ id: organisationId }),
      this.organisationHasAddressDao.findByOrganisationId({ organisationId }),
      this.contactDao.findByOrganisationId({ organisationId }),
    ]);
    const companyLogoUrl = org.logo ? await this.s3Service.getSignedUrl(org.logo.key) : null;

    let companyAddress = '';
    if (addressLinks.length > 0) {
      const addr = addressLinks[0].address;
      const parts = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.postalCode, addr.country.name].filter((p) => p?.length);
      companyAddress = parts.join(', ');
    }

    return this.mapToDetail(updated, {
      companyName: org.name,
      companyLogoUrl,
      companyAddress,
      companyPhones: contacts.filter((c) => c.contactType === 'phone').map((c) => c.contact),
      companyEmails: contacts.filter((c) => c.contactType === 'email').map((c) => c.contact),
      companyWebsites: contacts.filter((c) => c.contactType === 'website').map((c) => c.contact),
      currencySymbol: org.currency.symbol,
      currencyCode: org.currency.code,
    });
  }

  private mapToDetail(p: PayrollPayslipWithDetailsType, orgInfo: { companyName: string; companyLogoUrl: string | null; companyAddress: string; companyPhones: string[]; companyEmails: string[]; companyWebsites: string[]; currencySymbol: string | null; currencyCode: string }): PayslipDetailResponseType {
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
