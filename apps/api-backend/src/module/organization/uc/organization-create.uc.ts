import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { UserRoleDbEnum } from '@repo/db';
import type { OrganizationCreateRequestType, OrganizationResponseType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
import type { CurrentUserType, UserSelectTableRecordType } from '@repo/nest-lib';
import {
  AddressDao,
  CommonLoggerService,
  ContactDao,
  IUseCase,
  MediaDao,
  OrganizationDao,
  OrganizationHasAddressDao,
  OrganizationHasContactDao,
  OrganizationHasDocumentDao,
  OrganizationHasUserDao,
  OrganizationSettingDao,
  PrismaService,
  UserDao,
  UserInviteDao,
} from '@repo/nest-lib';
import { contactTypeDtoEnumToDbEnum, mediaTypeDtoEnumToDbEnum, noOfDaysInMonthDtoEnumToDbEnum } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { AppConfigService } from '#src/config/app-config.service.js';
import { S3Service } from '#src/external-service/s3.service.js';
import { EmailService } from '#src/service/email/email.service.js';
import { MediaService } from '#src/service/media.service.js';
import { PasswordService } from '#src/service/password.service.js';

import { BaseOrganizationUc } from './_base-organization.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: OrganizationCreateRequestType;
};

@Injectable()
export class OrganizationCreateUc extends BaseOrganizationUc implements IUseCase<Params, OrganizationResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organizationDao: OrganizationDao,
    organizationSettingDao: OrganizationSettingDao,
    organizationHasDocumentDao: OrganizationHasDocumentDao,
    organizationHasAddressDao: OrganizationHasAddressDao,
    organizationHasContactDao: OrganizationHasContactDao,
    addressDao: AddressDao,
    contactDao: ContactDao,
    s3Service: S3Service,
    private readonly userDao: UserDao,
    private readonly organizationHasUserDao: OrganizationHasUserDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
  ) {
    super(
      prisma,
      logger,
      organizationDao,
      organizationSettingDao,
      organizationHasDocumentDao,
      organizationHasAddressDao,
      organizationHasContactDao,
      addressDao,
      contactDao,
      s3Service,
    );
  }

  public async execute(params: Params): Promise<OrganizationResponseType> {
    this.logger.i('Creating organization', { name: params.dto.name, email: params.dto.email });
    const validateResult = await this.validate(params);

    const { organizationId, userId, inviteKey } = await this.transaction(async (tx) => {
      return await this.create(params, validateResult, tx);
    });

    void this.sendInviteEmail({
      userId,
      email: params.dto.email,
      inviteKey,
      organizationName: params.dto.name,
    });

    return await this.getOrganizationResponseById(organizationId);
  }

  private async validate(params: Params): Promise<{ existingUser: UserSelectTableRecordType | undefined }> {
    this.assertSuperAdmin(params.currentUser);

    const existing = await this.organizationDao.findByName({ name: params.dto.name });
    if (existing) {
      throw new ApiFieldValidationError('name', 'Organization name already exists');
    }

    const existingUser = await this.userDao.getByEmail({ email: params.dto.email });

    return { existingUser };
  }

  private async create(
    params: Params,
    validateResult: { existingUser: UserSelectTableRecordType | undefined },
    tx: Prisma.TransactionClient,
  ): Promise<{ organizationId: number; userId: number; inviteKey: string }> {
    const { existingUser } = validateResult;

    const organizationId = await this.organizationDao.create({
        data: { name: params.dto.name, currency: { connect: { id: params.dto.currencyId } } },
        tx,
      });

      let userId: number;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const randomPassword = this.passwordService.makeRandomKey();
        const hashedPassword = await this.passwordService.hash(randomPassword);

        userId = await this.userDao.create({
          data: {
            email: params.dto.email,
            firstname: params.dto.email.split('@')[0] ?? '',
            lastname: '',
            password: hashedPassword,
            isActive: false,
          },
          tx,
        });
      }

      await this.organizationHasUserDao.upsert({
        organizationId,
        userId,
        roles: [UserRoleDbEnum.admin],
        tx,
      });

      const inviteKey = this.passwordService.makeRandomKey();
      await this.userInviteDao.create({
        data: {
          user: { connect: { id: userId } },
          organization: { connect: { id: organizationId } },
          invitedBy: { connect: { id: params.currentUser.id } },
          inviteKey,
        },
        tx,
      });

      // Create logo if provided
      if (params.dto.logo) {
        const logoFile = await this.mediaService.moveTempFileAndGetKey({
          media: params.dto.logo,
          mediaPlacement: 'organization',
          relationId: organizationId,
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
              organization: { connect: { id: organizationId } },
            },
            tx,
          });

          await this.organizationDao.update({
            id: organizationId,
            data: { logo: { connect: { id: logoId } } },
            tx,
          });
        }
      }

      // Create settings if provided
      if (params.dto.settings) {
        await this.organizationSettingDao.create({
          data: {
            organization: { connect: { id: organizationId } },
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

      // Create documents if provided
      if (params.dto.documents && params.dto.documents.length > 0) {
        for (const doc of params.dto.documents) {
          const docFile = await this.mediaService.moveTempFileAndGetKey({
            media: doc,
            mediaPlacement: 'organization',
            relationId: organizationId,
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
                organization: { connect: { id: organizationId } },
              },
              tx,
            });

            await this.organizationHasDocumentDao.create({
              data: {
                organization: { connect: { id: organizationId } },
                document: { connect: { id: mediaId } },
                mediaType: mediaTypeDtoEnumToDbEnum(doc.mediaType),
              },
              tx,
            });
          }
        }
      }

      // Create address if provided
      if (params.dto.address) {
        const addressId = await this.addressDao.create({
          data: {
            organization: { connect: { id: organizationId } },
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

        await this.organizationHasAddressDao.create({
          data: {
            organization: { connect: { id: organizationId } },
            address: { connect: { id: addressId } },
          },
          tx,
        });
      }

      // Create contacts if provided
      if (params.dto.contacts && params.dto.contacts.length > 0) {
        for (const contactDto of params.dto.contacts) {
          const contactId = await this.contactDao.create({
            data: {
              organization: { connect: { id: organizationId } },
              contact: contactDto.contact,
              contactType: contactTypeDtoEnumToDbEnum(contactDto.contactType),
            },
            tx,
          });

          await this.organizationHasContactDao.create({
            data: {
              organization: { connect: { id: organizationId } },
              contact: { connect: { id: contactId } },
            },
            tx,
          });
        }
      }

    return { organizationId, userId, inviteKey };
  }

  private async sendInviteEmail(params: { userId: number; email: string; inviteKey: string; organizationName: string }): Promise<void> {
    try {
      await this.emailService.sendUserInvite({
        userId: params.userId,
        email: params.email,
        emailData: {
          userDisplayName: params.email,
          organizationName: params.organizationName,
          link: `${this.appConfigService.webAppBaseUrl}/auth/accept-invite/${params.userId}/${params.inviteKey}`,
        },
      });
    } catch (err) {
      this.logger.e('Failed to send organization invite email', { email: params.email });
    }
  }
}
