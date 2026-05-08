import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OrganisationResponseType, OrganisationUpdateRequestType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import {
  AddressDao,
  CommonLoggerService,
  ContactDao,
  IUseCase,
  MediaDao,
  OrganisationDao,
  OrganisationHasAddressDao,
  OrganisationHasContactDao,
  OrganisationHasDocumentDao,
  OrganisationSettingDao,
  PrismaService,
} from '@repo/nest-lib';
import { contactTypeDtoEnumToDbEnum, mediaTypeDtoEnumToDbEnum, noOfDaysInMonthDtoEnumToDbEnum } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseOrganisationUc } from './_base-organisation.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: OrganisationUpdateRequestType;
};

@Injectable()
export class OrganisationUpdateUc extends BaseOrganisationUc implements IUseCase<Params, OrganisationResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organisationDao: OrganisationDao,
    organisationSettingDao: OrganisationSettingDao,
    organisationHasDocumentDao: OrganisationHasDocumentDao,
    organisationHasAddressDao: OrganisationHasAddressDao,
    organisationHasContactDao: OrganisationHasContactDao,
    addressDao: AddressDao,
    contactDao: ContactDao,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
  ) {
    super(
      prisma,
      logger,
      organisationDao,
      organisationSettingDao,
      organisationHasDocumentDao,
      organisationHasAddressDao,
      organisationHasContactDao,
      addressDao,
      contactDao,
      s3Service,
    );
  }

  public async execute(params: Params): Promise<OrganisationResponseType> {
    this.logger.i('Updating organisation', { id: params.dto.id });
    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.update(params, tx);
    });

    return await this.getOrganisationResponseById(params.dto.id);
  }

  private async validate(params: Params): Promise<void> {
    this.assertOwnOrganisation(params.currentUser, params.dto.id);

    const existing = await this.organisationDao.findByName({ name: params.dto.name });
    if (existing && existing.id !== params.dto.id) {
      throw new ApiFieldValidationError('name', 'Organisation name already exists');
    }
  }

  private async update(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.organisationDao.update({
        id: params.dto.id,
        data: { name: params.dto.name, currency: { connect: { id: params.dto.currencyId } } },
        tx,
      });

      // Handle logo if provided
      if (params.dto.logo) {
        const existingOrg = await this.organisationDao.getByIdWithLogoOrThrow({ id: params.dto.id, tx });

        if (params.dto.logo.key.startsWith('temp/')) {
          // New logo uploaded
          const logoFile = await this.mediaService.moveTempFileAndGetKey({
            media: params.dto.logo,
            mediaPlacement: 'organisation',
            relationId: params.dto.id,
            isImage: params.dto.logo.type === MediaTypeDtoEnum.image,
          });

          if (logoFile) {
            const logoId = await this.mediaDao.create({
              data: {
                key: logoFile.newKey,
                name: params.dto.logo.name,
                type: mediaTypeDtoEnumToDbEnum(params.dto.logo.type),
                size: logoFile.size,
                ext: logoFile.ext,
                organisation: { connect: { id: params.dto.id } },
              },
              tx,
            });

            await this.organisationDao.update({
              id: params.dto.id,
              data: { logo: { connect: { id: logoId } } },
              tx,
            });
          }
        } else if (params.dto.logo.id && params.dto.logo.id !== existingOrg.logoId) {
          await this.organisationDao.update({
            id: params.dto.id,
            data: { logo: { connect: { id: params.dto.logo.id } } },
            tx,
          });
        }
      }

      // Update or create settings if provided
      if (params.dto.settings) {
        const existingSetting = await this.organisationSettingDao.findByOrganisationId({ organisationId: params.dto.id, tx });

        if (existingSetting) {
          await this.organisationSettingDao.update({
            id: existingSetting.id,
            data: {
              noOfDaysInMonth: noOfDaysInMonthDtoEnumToDbEnum(params.dto.settings.noOfDaysInMonth),
              totalLeaveInDays: params.dto.settings.totalLeaveInDays,
              sickLeaveInDays: params.dto.settings.sickLeaveInDays,
              earnedLeaveInDays: params.dto.settings.earnedLeaveInDays,
              casualLeaveInDays: params.dto.settings.casualLeaveInDays,
              maternityLeaveInDays: params.dto.settings.maternityLeaveInDays,
              paternityLeaveInDays: params.dto.settings.paternityLeaveInDays,
              weeklyOffDays: params.dto.settings.weeklyOffDays,
            },
            tx,
          });
        } else {
          await this.organisationSettingDao.create({
            data: {
              organisation: { connect: { id: params.dto.id } },
              noOfDaysInMonth: noOfDaysInMonthDtoEnumToDbEnum(params.dto.settings.noOfDaysInMonth),
              totalLeaveInDays: params.dto.settings.totalLeaveInDays,
              sickLeaveInDays: params.dto.settings.sickLeaveInDays,
              earnedLeaveInDays: params.dto.settings.earnedLeaveInDays,
              casualLeaveInDays: params.dto.settings.casualLeaveInDays,
              maternityLeaveInDays: params.dto.settings.maternityLeaveInDays,
              paternityLeaveInDays: params.dto.settings.paternityLeaveInDays,
              weeklyOffDays: params.dto.settings.weeklyOffDays,
            },
            tx,
          });
        }
      }

      // Remove documents if requested
      if (params.dto.removeDocumentIds && params.dto.removeDocumentIds.length > 0) {
        await this.organisationHasDocumentDao.deleteManyByIds({
          ids: params.dto.removeDocumentIds,
          tx,
        });
      }

      // Add new documents if provided
      if (params.dto.documents && params.dto.documents.length > 0) {
        for (const doc of params.dto.documents) {
          const docFile = await this.mediaService.moveTempFileAndGetKey({
            media: doc,
            mediaPlacement: 'organisation',
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
                organisation: { connect: { id: params.dto.id } },
              },
              tx,
            });

            await this.organisationHasDocumentDao.create({
              data: {
                organisation: { connect: { id: params.dto.id } },
                document: { connect: { id: mediaId } },
                mediaType: mediaTypeDtoEnumToDbEnum(doc.mediaType),
              },
              tx,
            });
          }
        }
      }

      // Handle address — replace existing with new (single address)
      if (params.dto.address) {
        // Remove existing address links and addresses
        const existingAddressLinks = await this.organisationHasAddressDao.findByOrganisationId({ organisationId: params.dto.id, tx });
        if (existingAddressLinks.length > 0) {
          await this.organisationHasAddressDao.deleteByOrganisationId({ organisationId: params.dto.id, tx });
          for (const link of existingAddressLinks) {
            await this.addressDao.deleteByIdOrThrow({ id: link.address.id, tx });
          }
        }

        // Create new address
        const addressId = await this.addressDao.create({
          data: {
            organisation: { connect: { id: params.dto.id } },
            country: { connect: { id: params.dto.address.countryId } },
            addressLine1: params.dto.address.addressLine1,
            addressLine2: params.dto.address.addressLine2,
            city: params.dto.address.city,
            state: params.dto.address.state,
            postalCode: params.dto.address.postalCode,
            latitude: params.dto.address.latitude,
            longitude: params.dto.address.longitude,
          },
          tx,
        });

        await this.organisationHasAddressDao.create({
          data: {
            organisation: { connect: { id: params.dto.id } },
            address: { connect: { id: addressId } },
          },
          tx,
        });
      }

      // Remove contacts if requested
      if (params.dto.removeContactIds && params.dto.removeContactIds.length > 0) {
        await this.organisationHasContactDao.deleteManyByContactIds({ contactIds: params.dto.removeContactIds, tx });
        await this.contactDao.deleteManyByIds({ ids: params.dto.removeContactIds, tx });
      }

      // Add/update contacts if provided
      if (params.dto.contacts && params.dto.contacts.length > 0) {
        for (const contactDto of params.dto.contacts) {
          if (contactDto.id) {
            // Update existing contact
            await this.contactDao.update({
              id: contactDto.id,
              data: {
                contact: contactDto.contact,
                contactType: contactTypeDtoEnumToDbEnum(contactDto.contactType),
              },
              tx,
            });
          } else {
            // Create new contact
            const contactId = await this.contactDao.create({
              data: {
                organisation: { connect: { id: params.dto.id } },
                contact: contactDto.contact,
                contactType: contactTypeDtoEnumToDbEnum(contactDto.contactType),
              },
              tx,
            });

            await this.organisationHasContactDao.create({
              data: {
                organisation: { connect: { id: params.dto.id } },
                contact: { connect: { id: contactId } },
              },
              tx,
            });
          }
        }
      }
  }
}
