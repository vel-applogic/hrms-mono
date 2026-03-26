import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { EmployeeMediaType, UserRoleDbEnum } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  EmployeeCreateRequestType,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
} from '@repo/dto';
import {
  AuditService,
  CommonLoggerService,
  CurrentUserType,
  EmployeeDao,
  EmployeeHasMediaDao,
  EmployeeLeaveCounterDao,
  IUseCase,
  LeaveConfigDao,
  MediaDao,
  OrganizationDao,
  OrganizationHasUserDao,
  PrismaService,
  UserDao,
  UserInviteDao,
} from '@repo/nest-lib';
import { ApiBadRequestError, ApiFieldValidationError, getFinancialYearCode } from '@repo/shared';

import { AppConfigService } from '#src/config/app-config.service.js';
import { S3Service } from '#src/external-service/s3.service.js';
import { EmailService } from '#src/service/email/email.service.js';
import { MediaService } from '#src/service/media.service.js';
import { PasswordService } from '#src/service/password.service.js';

import { BaseEmployeeUc } from './_base-employee.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeCreateRequestType;
};

@Injectable()
export class EmployeeCreateUc extends BaseEmployeeUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    employeeDao: EmployeeDao,
    employeeHasMediaDao: EmployeeHasMediaDao,
    s3Service: S3Service,
    private readonly userDao: UserDao,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly leaveConfigDao: LeaveConfigDao,
    private readonly employeeLeaveCounterDao: EmployeeLeaveCounterDao,
    private readonly organizationHasUserDao: OrganizationHasUserDao,
    private readonly organizationDao: OrganizationDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
  ) {
    super(prisma, logger, employeeDao, employeeHasMediaDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating employee', { email: params.dto.email });

    if (params.currentUser.organizationId <= 0) {
      throw new ApiBadRequestError('Organization context is required to create employees');
    }

    const org = await this.organizationDao.findById({ id: params.currentUser.organizationId });
    if (!org) {
      throw new ApiBadRequestError('Organization not found');
    }

    const existingUser = await this.userDao.getByEmail({ email: params.dto.email });

    const [duplicateCode, duplicatePan, duplicateAadhaar] = await Promise.all([
      this.employeeDao.findByEmployeeCode({ employeeCode: params.dto.employeeCode, organizationId: params.currentUser.organizationId }),
      this.employeeDao.findByPan({ pan: params.dto.pan, organizationId: params.currentUser.organizationId }),
      this.employeeDao.findByAadhaar({ aadhaar: params.dto.aadhaar, organizationId: params.currentUser.organizationId }),
    ]);
    if (duplicateCode) throw new ApiFieldValidationError('employeeCode', 'Employee code already exists in this organisation');
    if (duplicatePan) throw new ApiFieldValidationError('pan', 'PAN already registered in this organisation');
    if (duplicateAadhaar) throw new ApiFieldValidationError('aadhaar', 'Aadhaar already registered in this organisation');

    const { userId, inviteKey } = await this.transaction(async (tx) => {
      let userId: number;

      if (existingUser) {
        // User already exists — just link to org and send invite
        userId = existingUser.id;
      } else {
        // New user — create with isActive: false
        const randomPassword = this.passwordService.makeRandomKey();
        const hashedPassword = await this.passwordService.hash(randomPassword);

        const user = await this.userDao.create({
          data: {
            email: params.dto.email,
            firstname: params.dto.firstname,
            lastname: params.dto.lastname,
            password: hashedPassword,
            isActive: false,
          },
          tx,
        });
        userId = user.id;

        const dateOfJoining = new Date(params.dto.dateOfJoining);
        await this.employeeDao.create({
          data: {
            user: { connect: { id: userId } },
            organization: { connect: { id: params.currentUser.organizationId } },
            employeeCode: params.dto.employeeCode,
            personalEmail: params.dto.personalEmail ?? undefined,
            dob: new Date(params.dto.dob),
            pan: params.dto.pan,
            aadhaar: params.dto.aadhaar,
            designation: params.dto.designation,
            dateOfJoining,
            dateOfLeaving: params.dto.dateOfLeaving ? new Date(params.dto.dateOfLeaving) : undefined,
            status: params.dto.status,
            reportTo: params.dto.reportToId ? { connect: { id: params.dto.reportToId } } : undefined,
          },
          tx,
        });

        const financialYear = getFinancialYearCode(dateOfJoining);
        const leaveConfig = await this.leaveConfigDao.getLatest({ tx });
        const totalLeavesAvailable = leaveConfig?.maxLeaves ?? 24;
        await this.employeeLeaveCounterDao.create({
          data: {
            user: { connect: { id: userId } },
            organization: { connect: { id: params.currentUser.organizationId } },
            financialYear,
            casualLeaves: 0,
            sickLeaves: 0,
            earnedLeaves: 0,
            totalLeavesUsed: 0,
            totalLeavesAvailable,
          },
          tx,
        });

        if (params.dto.photo?.key?.startsWith('temp/')) {
          await this.createAndLinkMedia({ media: params.dto.photo, userId, organizationId: params.currentUser.organizationId, type: EmployeeMediaType.photo, tx });
        }
      }

      // Always upsert org membership with employee role
      await this.organizationHasUserDao.upsert({
        organizationId: params.currentUser.organizationId,
        userId,
        roles: [UserRoleDbEnum.employee],
        tx,
      });

      // Always create a fresh invite
      const inviteKey = this.passwordService.makeRandomKey();
      await this.userInviteDao.create({
        data: {
          user: { connect: { id: userId } },
          organization: { connect: { id: params.currentUser.organizationId } },
          invitedBy: { connect: { id: params.currentUser.id } },
          inviteKey,
        },
        tx,
      });

      return { userId, inviteKey };
    });

    void this.sendInviteEmail({ userId, email: params.dto.email, inviteKey, organizationName: org.name });

    if (!existingUser) {
      const employee = await this.getById(userId, params.currentUser.organizationId);
      void this.recordActivity(params, employee ?? null);
    }

    return { success: true, message: 'Employee added and invitation sent' };
  }

  private async sendInviteEmail(params: { userId: number; email: string; inviteKey: string; organizationName: string }): Promise<void> {
    await this.emailService.sendUserInvite({
      userId: params.userId,
      email: params.email,
      emailData: {
        userDisplayName: params.email,
        organizationName: params.organizationName,
        link: `${this.appConfigService.webAppBaseUrl}/auth/accept-invite/${params.userId}/${params.inviteKey}`,
      },
    });
  }

  private async createAndLinkMedia(params: {
    media: MediaUpsertType;
    userId: number;
    organizationId: number;
    type: EmployeeMediaType;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.media,
      mediaPlacement: 'employee',
      relationId: params.userId,
      isImage: params.media.type === MediaTypeDtoEnum.image,
    });
    if (!file) return;

    const mediaId = await this.mediaDao.create({
      data: { key: file.newKey, name: params.media.name, type: params.media.type, size: file.size, ext: file.ext, organization: { connect: { id: params.organizationId } } },
      tx: params.tx,
    });

    await this.employeeHasMediaDao.create({
      data: { userId: params.userId, mediaId, type: params.type },
      tx: params.tx,
    });
  }

  private async recordActivity(params: Params, created: Awaited<ReturnType<BaseEmployeeUc['getById']>> | null): Promise<void> {
    if (!created) return;
    const changes = this.computeChanges({
      oldValues: {},
      newValues: { firstname: created.firstname, lastname: created.lastname, email: created.email },
    });
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Employee created',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.employee, entityId: created.id }],
    });
  }
}
