import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { GenderDbEnum, UserRoleDbEnum } from '@repo/db';
import type { OrganisationCreateRequestType, OrganisationResponseType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
import type { CurrentUserType, UserSelectTableRecordType } from '@repo/nest-lib';
import {
  AddressDao,
  BranchDao,
  CommonLoggerService,
  ContactDao,
  IUseCase,
  MediaDao,
  OrganisationDao,
  OrganisationHasAddressDao,
  OrganisationHasContactDao,
  OrganisationHasDocumentDao,
  OrganisationHasUserDao,
  OrganisationSettingDao,
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

import { BaseOrganisationUc } from './_base-organisation.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: OrganisationCreateRequestType;
};

@Injectable()
export class OrganisationCreateUc extends BaseOrganisationUc implements IUseCase<Params, OrganisationResponseType> {
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
    private readonly userDao: UserDao,
    private readonly organisationHasUserDao: OrganisationHasUserDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly passwordService: PasswordService,
    private readonly branchDao: BranchDao,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
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
    this.logger.i('Creating organisation', { name: params.dto.name, email: params.dto.email });
    const validateResult = await this.validate(params);

    const { organisationId, userId, inviteKey } = await this.transaction(async (tx) => {
      return await this.create(params, validateResult, tx);
    });

    void this.sendInviteEmail({
      userId,
      email: params.dto.email,
      inviteKey,
      organisationName: params.dto.name,
    });

    return await this.getOrganisationResponseById(organisationId);
  }

  private async validate(params: Params): Promise<{ existingUser: UserSelectTableRecordType | undefined }> {
    this.assertSuperAdmin(params.currentUser);

    const existing = await this.organisationDao.findByName({ name: params.dto.name });
    if (existing) {
      throw new ApiFieldValidationError('name', 'Organisation name already exists');
    }

    const existingUser = await this.userDao.getByEmail({ email: params.dto.email });

    return { existingUser };
  }

  private async create(
    params: Params,
    validateResult: { existingUser: UserSelectTableRecordType | undefined },
    tx: Prisma.TransactionClient,
  ): Promise<{ organisationId: number; userId: number; inviteKey: string }> {
    const { existingUser } = validateResult;

    const organisationId = await this.organisationDao.create({
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
            gender: GenderDbEnum.other,
            isActive: false,
          },
          tx,
        });
      }

      await this.organisationHasUserDao.upsert({
        organisationId,
        userId,
        roles: [UserRoleDbEnum.admin],
        tx,
      });

      // Auto-create a default branch with the organisation name
      await this.branchDao.create({
        data: {
          name: params.dto.name,
          organisation: { connect: { id: organisationId } },
        },
        tx,
      });

      const inviteKey = this.passwordService.makeRandomKey();
      await this.userInviteDao.create({
        data: {
          user: { connect: { id: userId } },
          organisation: { connect: { id: organisationId } },
          invitedBy: { connect: { id: params.currentUser.id } },
          inviteKey,
        },
        tx,
      });

      // Create logo if provided
      if (params.dto.logo) {
        const logoFile = await this.mediaService.moveTempFileAndGetKey({
          media: params.dto.logo,
          mediaPlacement: 'organisation',
          relationId: organisationId,
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
              organisation: { connect: { id: organisationId } },
            },
            tx,
          });

          await this.organisationDao.update({
            id: organisationId,
            data: { logo: { connect: { id: logoId } } },
            tx,
          });
        }
      }

      // Create settings if provided
      if (params.dto.settings) {
        await this.organisationSettingDao.create({
          data: {
            organisation: { connect: { id: organisationId } },
            noOfDaysInMonth: noOfDaysInMonthDtoEnumToDbEnum(params.dto.settings.noOfDaysInMonth),
            totalLeaveInDays: params.dto.settings.totalLeaveInDays,
            sickLeaveInDays: params.dto.settings.sickLeaveInDays,
            earnedLeaveInDays: params.dto.settings.earnedLeaveInDays,
            casualLeaveInDays: params.dto.settings.casualLeaveInDays,
            maternityLeaveInDays: params.dto.settings.maternityLeaveInDays,
            paternityLeaveInDays: params.dto.settings.paternityLeaveInDays,
            weeklyOffDays: params.dto.settings.weeklyOffDays,
            financialYearStartsAt: params.dto.settings.financialYearStartsAt,
          },
          tx,
        });
      }

      // Create documents if provided
      if (params.dto.documents && params.dto.documents.length > 0) {
        for (const doc of params.dto.documents) {
          const docFile = await this.mediaService.moveTempFileAndGetKey({
            media: doc,
            mediaPlacement: 'organisation',
            relationId: organisationId,
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
                organisation: { connect: { id: organisationId } },
              },
              tx,
            });

            await this.organisationHasDocumentDao.create({
              data: {
                organisation: { connect: { id: organisationId } },
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
            organisation: { connect: { id: organisationId } },
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
            organisation: { connect: { id: organisationId } },
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
              organisation: { connect: { id: organisationId } },
              contact: contactDto.contact,
              contactType: contactTypeDtoEnumToDbEnum(contactDto.contactType),
            },
            tx,
          });

          await this.organisationHasContactDao.create({
            data: {
              organisation: { connect: { id: organisationId } },
              contact: { connect: { id: contactId } },
            },
            tx,
          });
        }
      }

    return { organisationId, userId, inviteKey };
  }

  private async sendInviteEmail(params: { userId: number; email: string; inviteKey: string; organisationName: string }): Promise<void> {
    try {
      await this.emailService.sendUserInvite({
        userId: params.userId,
        email: params.email,
        emailData: {
          userDisplayName: params.email,
          organisationName: params.organisationName,
          link: `${this.appConfigService.webAppBaseUrl}/auth/accept-invite/${params.userId}/${params.inviteKey}`,
        },
      });
    } catch (err) {
      this.logger.e('Failed to send organisation invite email', { email: params.email });
    }
  }
}
