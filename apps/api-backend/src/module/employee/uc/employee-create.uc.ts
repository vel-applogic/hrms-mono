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
  MediaDao,
  OrganizationDao,
  OrganizationHasUserDao,
  OrganizationSettingDao,
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
    private readonly employeeLeaveCounterDao: EmployeeLeaveCounterDao,
    private readonly organizationHasUserDao: OrganizationHasUserDao,
    private readonly organizationDao: OrganizationDao,
    private readonly organizationSettingDao: OrganizationSettingDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
  ) {
    super(prisma, logger, employeeDao, employeeHasMediaDao, s3Service);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating employee', { email: params.dto.email });
    const validateResult = await this.validate(params);
    const { organizationName, existingUserId } = validateResult;

    const { userId, inviteKey } = await this.transaction(async (tx) => {
      let userId: number;

      if (existingUserId !== null) {
        // User already exists — just link to org and send invite
        userId = existingUserId;
      } else {
        userId = await this.createNewUserAndEmployee(params, tx);
      }

      await this.upsertOrgMembership(params, userId, tx);
      const inviteKey = await this.createInvite(params, userId, tx);

      return { userId, inviteKey };
    });

    void this.sendInviteEmail({ userId, email: params.dto.email, inviteKey, organizationName });

    if (existingUserId === null) {
      const employee = await this.getById(userId, params.currentUser.organizationId);
      void this.recordActivity(params, employee ?? null);
    }

    return { success: true, message: 'Employee added and invitation sent' };
  }

  private async validate(params: Params): Promise<{ organizationName: string; existingUserId: number | null }> {
    this.assertAdmin(params.currentUser);

    if (params.currentUser.organizationId <= 0) {
      throw new ApiBadRequestError('Organization context is required to create employees');
    }

    const org = await this.organizationDao.findById({ id: params.currentUser.organizationId });
    if (!org) {
      throw new ApiBadRequestError('Organization not found');
    }

    const existingUser = await this.userDao.getByEmail({ email: params.dto.email });

    const duplicateCode = await this.employeeDao.findByEmployeeCode({ employeeCode: params.dto.employeeCode, organizationId: params.currentUser.organizationId });
    if (duplicateCode) throw new ApiFieldValidationError('employeeCode', 'Employee code already exists in this organisation');

    if (params.dto.pan) {
      const duplicatePan = await this.employeeDao.findByPan({ pan: params.dto.pan, organizationId: params.currentUser.organizationId });
      if (duplicatePan) throw new ApiFieldValidationError('pan', 'PAN already registered in this organisation');
    }
    if (params.dto.aadhaar) {
      const duplicateAadhaar = await this.employeeDao.findByAadhaar({ aadhaar: params.dto.aadhaar, organizationId: params.currentUser.organizationId });
      if (duplicateAadhaar) throw new ApiFieldValidationError('aadhaar', 'Aadhaar already registered in this organisation');
    }

    return {
      organizationName: org.name,
      existingUserId: existingUser?.id ?? null,
    };
  }

  private async createNewUserAndEmployee(params: Params, tx: Prisma.TransactionClient): Promise<number> {
    // New user — create with isActive: false
    const randomPassword = this.passwordService.makeRandomKey();
    const hashedPassword = await this.passwordService.hash(randomPassword);

    const userId = await this.userDao.create({
      data: {
        email: params.dto.email,
        firstname: params.dto.firstname,
        lastname: params.dto.lastname,
        password: hashedPassword,
        isActive: false,
      },
      tx,
    });

    const dateOfJoining = new Date(params.dto.dateOfJoining);
    await this.employeeDao.create({
      data: {
        user: { connect: { id: userId } },
        organization: { connect: { id: params.currentUser.organizationId } },
        employeeCode: params.dto.employeeCode,
        personalEmail: params.dto.personalEmail ?? undefined,
        dob: new Date(params.dto.dob),
        pan: params.dto.pan ?? undefined,
        aadhaar: params.dto.aadhaar ?? undefined,
        designation: params.dto.designation,
        dateOfJoining,
        dateOfLeaving: params.dto.dateOfLeaving ? new Date(params.dto.dateOfLeaving) : undefined,
        status: params.dto.status,
        reportTo: params.dto.reportToId ? { connect: { id: params.dto.reportToId } } : undefined,
        branch: params.dto.branchId ? { connect: { id: params.dto.branchId } } : undefined,
        department: params.dto.departmentId ? { connect: { id: params.dto.departmentId } } : undefined,
        isBgVerified: params.dto.isBgVerified ?? false,
        emergencyContactName: params.dto.emergencyContactName,
        emergencyContactNumber: params.dto.emergencyContactNumber,
        emergencyContactRelationship: params.dto.emergencyContactRelationship,
      },
      tx,
    });

    const financialYear = getFinancialYearCode(dateOfJoining);
    const orgSettings = await this.organizationSettingDao.findByOrganizationId({ organizationId: params.currentUser.organizationId, tx });
    const totalLeavesAvailable = orgSettings?.totalLeaveInDays ?? 24;
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

    return userId;
  }

  private async upsertOrgMembership(params: Params, userId: number, tx: Prisma.TransactionClient): Promise<void> {
    // Always upsert org membership with employee role
    await this.organizationHasUserDao.upsert({
      organizationId: params.currentUser.organizationId,
      userId,
      roles: [UserRoleDbEnum.employee],
      tx,
    });
  }

  private async createInvite(params: Params, userId: number, tx: Prisma.TransactionClient): Promise<string> {
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
    return inviteKey;
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
