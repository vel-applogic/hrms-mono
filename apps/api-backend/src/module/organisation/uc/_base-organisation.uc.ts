import type { AddressResponseType, ContactResponseType, MediaResponseType, OrganisationDetailResponseType, OrganisationResponseType } from '@repo/dto';
import type {
  ContactSelectTableRecordType,
  CurrentUserType,
  OrganisationHasAddressWithAddressType,
  OrganisationHasDocumentWithMediaType,
  OrganisationSettingSelectTableRecordType,
  OrganisationWithCurrencyType,
  OrganisationWithLogoType,
} from '@repo/nest-lib';
import {
  AddressDao,
  BaseUc,
  CommonLoggerService,
  ContactDao,
  OrganisationDao,
  OrganisationHasAddressDao,
  OrganisationHasContactDao,
  OrganisationHasDocumentDao,
  OrganisationSettingDao,
  PrismaService,
} from '@repo/nest-lib';
import { contactTypeDbEnumToDtoEnum, mediaTypeDbEnumToDtoEnum, noOfDaysInMonthDbEnumToDtoEnum } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

export class BaseOrganisationUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly organisationDao: OrganisationDao,
    protected readonly organisationSettingDao: OrganisationSettingDao,
    protected readonly organisationHasDocumentDao: OrganisationHasDocumentDao,
    protected readonly organisationHasAddressDao: OrganisationHasAddressDao,
    protected readonly organisationHasContactDao: OrganisationHasContactDao,
    protected readonly addressDao: AddressDao,
    protected readonly contactDao: ContactDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  protected dbToOrganisationResponse(dbRec: OrganisationWithCurrencyType): OrganisationResponseType {
    return {
      id: dbRec.id,
      name: dbRec.name,
      currency: {
        id: dbRec.currency.id,
        code: dbRec.currency.code,
        name: dbRec.currency.name,
        symbol: dbRec.currency.symbol,
      },
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async dbToOrganisationDetailResponse(
    dbRec: OrganisationWithLogoType,
    setting: OrganisationSettingSelectTableRecordType | undefined,
    documents: OrganisationHasDocumentWithMediaType[],
    addressLinks: OrganisationHasAddressWithAddressType[],
    contacts: ContactSelectTableRecordType[],
  ): Promise<OrganisationDetailResponseType> {
    return {
      ...this.dbToOrganisationResponse(dbRec),
      logo: dbRec.logo ? await this.dbToLogoResponse(dbRec.logo) : null,
      settings: setting ? this.dbToSettingResponse(setting) : null,
      documents: await Promise.all(documents.map((doc) => this.dbToDocumentResponse(doc))),
      address: addressLinks.length > 0 ? this.dbToAddressResponse(addressLinks[0]) : null,
      contacts: contacts.map((c) => this.dbToContactResponse(c)),
    };
  }

  private dbToAddressResponse(orgAddress: OrganisationHasAddressWithAddressType): AddressResponseType {
    const addr = orgAddress.address;
    return {
      id: addr.id,
      countryId: addr.countryId,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      latitude: addr.latitude ?? undefined,
      longitude: addr.longitude ?? undefined,
      country: {
        id: addr.country.id,
        name: addr.country.name,
        code: addr.country.code,
      },
    };
  }

  private dbToContactResponse(contact: ContactSelectTableRecordType): ContactResponseType {
    return {
      id: contact.id,
      contact: contact.contact,
      contactType: contactTypeDbEnumToDtoEnum(contact.contactType),
    };
  }

  private async dbToLogoResponse(logo: NonNullable<OrganisationWithLogoType['logo']>): Promise<MediaResponseType> {
    const logoUrl = await this.s3Service.getSignedUrl(logo.key);
    return {
      id: logo.id,
      key: logo.key,
      name: logo.name,
      type: mediaTypeDbEnumToDtoEnum(logo.type),
      size: logo.size,
      ext: logo.ext,
      urlFull: logoUrl,
    };
  }

  private dbToSettingResponse(setting: OrganisationSettingSelectTableRecordType): OrganisationDetailResponseType['settings'] {
    return {
      id: setting.id,
      noOfDaysInMonth: noOfDaysInMonthDbEnumToDtoEnum(setting.noOfDaysInMonth),
      totalLeaveInDays: setting.totalLeaveInDays,
      sickLeaveInDays: setting.sickLeaveInDays,
      earnedLeaveInDays: setting.earnedLeaveInDays,
      casualLeaveInDays: setting.casualLeaveInDays,
      maternityLeaveInDays: setting.maternityLeaveInDays,
      paternityLeaveInDays: setting.paternityLeaveInDays,
      weeklyOffDays: setting.weeklyOffDays,
      financialYearStartsAt: setting.financialYearStartsAt,
    };
  }

  private async dbToDocumentResponse(doc: OrganisationHasDocumentWithMediaType): Promise<{ id: number; mediaType: MediaResponseType['type']; document: MediaResponseType }> {
    const urlFull = await this.s3Service.getSignedUrl(doc.document.key);
    return {
      id: doc.id,
      mediaType: mediaTypeDbEnumToDtoEnum(doc.mediaType),
      document: {
        id: doc.document.id,
        key: doc.document.key,
        name: doc.document.name,
        type: mediaTypeDbEnumToDtoEnum(doc.document.type),
        size: doc.document.size,
        ext: doc.document.ext,
        urlFull,
      },
    };
  }

  protected async getOrganisationResponseById(id: number): Promise<OrganisationResponseType> {
    try {
      const dbRec = await this.organisationDao.getByIdOrThrow({ id });
      return this.dbToOrganisationResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Organisation not found');
      }
      throw error;
    }
  }

  protected async getOrganisationDetailById(id: number): Promise<OrganisationDetailResponseType> {
    try {
      const dbRec = await this.organisationDao.getByIdWithLogoOrThrow({ id });
      const [setting, documents, addressLinks, contacts] = await Promise.all([
        this.organisationSettingDao.findByOrganisationId({ organisationId: id }),
        this.organisationHasDocumentDao.findByOrganisationId({ organisationId: id }),
        this.organisationHasAddressDao.findByOrganisationId({ organisationId: id }),
        this.contactDao.findByOrganisationId({ organisationId: id }),
      ]);
      return this.dbToOrganisationDetailResponse(dbRec, setting, documents, addressLinks, contacts);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Organisation not found');
      }
      throw error;
    }
  }
}
