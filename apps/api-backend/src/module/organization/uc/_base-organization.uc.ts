import type { MediaResponseType, OrganizationDetailResponseType, OrganizationResponseType } from '@repo/dto';
import type {
  CurrentUserType,
  OrganizationHasDocumentWithMediaType,
  OrganizationSettingSelectTableRecordType,
  OrganizationWithCurrencyType,
  OrganizationWithLogoType,
} from '@repo/nest-lib';
import {
  BaseUc,
  CommonLoggerService,
  OrganizationDao,
  OrganizationHasDocumentDao,
  OrganizationSettingDao,
  PrismaService,
} from '@repo/nest-lib';
import { mediaTypeDbEnumToDtoEnum, noOfDaysInMonthDbEnumToDtoEnum } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

export class BaseOrganizationUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly organizationDao: OrganizationDao,
    protected readonly organizationSettingDao: OrganizationSettingDao,
    protected readonly organizationHasDocumentDao: OrganizationHasDocumentDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  protected assertSuperAdmin(currentUser: CurrentUserType): void {
    if (!currentUser.isSuperAdmin) {
      throw new ApiBadRequestError('Only super admins can access this resource');
    }
  }

  protected dbToOrganizationResponse(dbRec: OrganizationWithCurrencyType): OrganizationResponseType {
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

  protected async dbToOrganizationDetailResponse(
    dbRec: OrganizationWithLogoType,
    setting: OrganizationSettingSelectTableRecordType | undefined,
    documents: OrganizationHasDocumentWithMediaType[],
  ): Promise<OrganizationDetailResponseType> {
    return {
      ...this.dbToOrganizationResponse(dbRec),
      logo: dbRec.logo ? await this.dbToLogoResponse(dbRec.logo) : null,
      settings: setting ? this.dbToSettingResponse(setting) : null,
      documents: await Promise.all(documents.map((doc) => this.dbToDocumentResponse(doc))),
    };
  }

  private async dbToLogoResponse(logo: NonNullable<OrganizationWithLogoType['logo']>): Promise<MediaResponseType> {
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

  private dbToSettingResponse(setting: OrganizationSettingSelectTableRecordType): OrganizationDetailResponseType['settings'] {
    return {
      id: setting.id,
      noOfDaysInMonth: noOfDaysInMonthDbEnumToDtoEnum(setting.noOfDaysInMonth),
      totalLeaveInDays: setting.totalLeaveInDays,
      sickLeaveInDays: setting.sickLeaveInDays,
      earnedLeaveInDays: setting.earnedLeaveInDays,
      casualLeaveInDays: setting.casualLeaveInDays,
      maternityLeaveInDays: setting.maternityLeaveInDays,
      paternityLeaveInDays: setting.paternityLeaveInDays,
    };
  }

  private async dbToDocumentResponse(doc: OrganizationHasDocumentWithMediaType): Promise<{ id: number; mediaType: MediaResponseType['type']; document: MediaResponseType }> {
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

  protected async getOrganizationResponseById(id: number): Promise<OrganizationResponseType> {
    try {
      const dbRec = await this.organizationDao.getByIdOrThrow({ id });
      return this.dbToOrganizationResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Organization not found');
      }
      throw error;
    }
  }

  protected async getOrganizationDetailById(id: number): Promise<OrganizationDetailResponseType> {
    try {
      const dbRec = await this.organizationDao.getByIdWithLogoOrThrow({ id });
      const [setting, documents] = await Promise.all([
        this.organizationSettingDao.findByOrganizationId({ organizationId: id }),
        this.organizationHasDocumentDao.findByOrganizationId({ organizationId: id }),
      ]);
      return this.dbToOrganizationDetailResponse(dbRec, setting, documents);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Organization not found');
      }
      throw error;
    }
  }
}
