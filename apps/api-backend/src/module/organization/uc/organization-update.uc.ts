import { Injectable } from '@nestjs/common';
import type { OrganizationResponseType, OrganizationUpdateRequestType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import {
  CommonLoggerService,
  IUseCase,
  MediaDao,
  OrganizationDao,
  OrganizationHasDocumentDao,
  OrganizationSettingDao,
  PrismaService,
} from '@repo/nest-lib';
import { mediaTypeDtoEnumToDbEnum, noOfDaysInMonthDtoEnumToDbEnum } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseOrganizationUc } from './_base-organization.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: OrganizationUpdateRequestType;
};

@Injectable()
export class OrganizationUpdateUc extends BaseOrganizationUc implements IUseCase<Params, OrganizationResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organizationDao: OrganizationDao,
    organizationSettingDao: OrganizationSettingDao,
    organizationHasDocumentDao: OrganizationHasDocumentDao,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
  ) {
    super(prisma, logger, organizationDao, organizationSettingDao, organizationHasDocumentDao, s3Service);
  }

  async execute(params: Params): Promise<OrganizationResponseType> {
    this.assertSuperAdmin(params.currentUser);
    this.logger.i('Updating organization', { id: params.dto.id });

    const existing = await this.organizationDao.findByName({ name: params.dto.name });
    if (existing && existing.id !== params.dto.id) {
      throw new ApiFieldValidationError('name', 'Organization name already exists');
    }

    await this.transaction(async (tx) => {
      await this.organizationDao.update({
        id: params.dto.id,
        data: { name: params.dto.name },
        tx,
      });

      // Update or create settings if provided
      if (params.dto.settings) {
        const existingSetting = await this.organizationSettingDao.findByOrganizationId({ organizationId: params.dto.id, tx });

        // Handle logo
        let logoId: number;
        if (params.dto.settings.logo.key.startsWith('temp/')) {
          // New logo uploaded
          const logoFile = await this.mediaService.moveTempFileAndGetKey({
            media: params.dto.settings.logo,
            mediaPlacement: 'organization',
            relationId: params.dto.id,
            isImage: params.dto.settings.logo.type === MediaTypeDtoEnum.image,
          });

          if (logoFile) {
            logoId = await this.mediaDao.create({
              data: {
                key: logoFile.newKey,
                name: params.dto.settings.logo.name,
                type: mediaTypeDtoEnumToDbEnum(params.dto.settings.logo.type),
                size: logoFile.size,
                ext: logoFile.ext,
                organization: { connect: { id: params.dto.id } },
              },
              tx,
            });
          } else {
            logoId = existingSetting?.logoId ?? 0;
          }
        } else {
          // Existing logo - use the id from the existing setting or the upsert media id
          logoId = params.dto.settings.logo.id ?? existingSetting?.logoId ?? 0;
        }

        if (existingSetting) {
          await this.organizationSettingDao.update({
            id: existingSetting.id,
            data: {
              logo: { connect: { id: logoId } },
              noOfDaysInMonth: noOfDaysInMonthDtoEnumToDbEnum(params.dto.settings.noOfDaysInMonth),
              totalLeaveInDays: params.dto.settings.totalLeaveInDays,
              sickLeaveInDays: params.dto.settings.sickLeaveInDays,
              earnedLeaveInDays: params.dto.settings.earnedLeaveInDays,
              casualLeaveInDays: params.dto.settings.casualLeaveInDays,
              maternityLeaveInDays: params.dto.settings.maternityLeaveInDays,
              paternityLeaveInDays: params.dto.settings.paternityLeaveInDays,
            },
            tx,
          });
        } else {
          await this.organizationSettingDao.create({
            data: {
              organization: { connect: { id: params.dto.id } },
              logo: { connect: { id: logoId } },
              noOfDaysInMonth: noOfDaysInMonthDtoEnumToDbEnum(params.dto.settings.noOfDaysInMonth),
              totalLeaveInDays: params.dto.settings.totalLeaveInDays,
              sickLeaveInDays: params.dto.settings.sickLeaveInDays,
              earnedLeaveInDays: params.dto.settings.earnedLeaveInDays,
              casualLeaveInDays: params.dto.settings.casualLeaveInDays,
              maternityLeaveInDays: params.dto.settings.maternityLeaveInDays,
              paternityLeaveInDays: params.dto.settings.paternityLeaveInDays,
            },
            tx,
          });
        }
      }

      // Remove documents if requested
      if (params.dto.removeDocumentIds && params.dto.removeDocumentIds.length > 0) {
        await this.organizationHasDocumentDao.deleteManyByIds({
          ids: params.dto.removeDocumentIds,
          tx,
        });
      }

      // Add new documents if provided
      if (params.dto.documents && params.dto.documents.length > 0) {
        for (const doc of params.dto.documents) {
          const docFile = await this.mediaService.moveTempFileAndGetKey({
            media: doc,
            mediaPlacement: 'organization',
            relationId: params.dto.id,
            isImage: doc.type === MediaTypeDtoEnum.image,
          });

          if (docFile) {
            const mediaId = await this.mediaDao.create({
              data: {
                key: docFile.newKey,
                name: doc.name,
                type: mediaTypeDtoEnumToDbEnum(doc.type),
                size: docFile.size,
                ext: docFile.ext,
                organization: { connect: { id: params.dto.id } },
              },
              tx,
            });

            await this.organizationHasDocumentDao.create({
              data: {
                organization: { connect: { id: params.dto.id } },
                document: { connect: { id: mediaId } },
                mediaType: mediaTypeDtoEnumToDbEnum(doc.mediaType),
              },
              tx,
            });
          }
        }
      }
    });

    return await this.getOrganizationResponseById(params.dto.id);
  }
}
