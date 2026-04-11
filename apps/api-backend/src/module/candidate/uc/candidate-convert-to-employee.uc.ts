import { Injectable } from '@nestjs/common';
import { Prisma, UserRoleDbEnum } from '@repo/db';
import type { CandidateConvertToEmployeeRequestType, OperationStatusResponseType } from '@repo/dto';
import {
  CandidateDao,
  CommonLoggerService,
  CurrentUserType,
  EmployeeDao,
  EmployeeLeaveCounterDao,
  IUseCase,
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
import { PasswordService } from '#src/service/password.service.js';

import { BaseCandidateUc } from './_base-candidate.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: CandidateConvertToEmployeeRequestType;
};

type CandidateRecord = NonNullable<Awaited<ReturnType<CandidateDao['getById']>>>;
type OrganizationRecord = NonNullable<Awaited<ReturnType<OrganizationDao['findById']>>>;
type ExistingUserRecord = Awaited<ReturnType<UserDao['getByEmail']>>;

@Injectable()
export class CandidateConvertToEmployeeUc extends BaseCandidateUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    candidateDao: CandidateDao,
    s3Service: S3Service,
    private readonly userDao: UserDao,
    private readonly employeeDao: EmployeeDao,
    private readonly organizationDao: OrganizationDao,
    private readonly organizationHasUserDao: OrganizationHasUserDao,
    private readonly organizationSettingDao: OrganizationSettingDao,
    private readonly employeeLeaveCounterDao: EmployeeLeaveCounterDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
  ) {
    super(prisma, logger, candidateDao, s3Service);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Converting candidate to employee', { candidateId: params.id });
    const { candidate, org } = await this.validate(params);

    const existingUser = await this.userDao.getByEmail({ email: candidate.email });

    const { userId, inviteKey } = await this.transaction(async (tx) => {
      const userId = await this.ensureUser(candidate, existingUser, tx);
      const employeeId = await this.createEmployee(params, candidate, userId, tx);
      await this.createLeaveCounter(params, userId, tx);
      await this.upsertOrgUser(params, userId, tx);
      const inviteKey = await this.createInvite(params, userId, tx);
      await this.linkEmployeeToCandidate(params, candidate.id, employeeId, tx);
      return { userId, inviteKey };
    });

    void this.sendInviteEmail({ userId, email: candidate.email, inviteKey, organizationName: org.name });

    return { success: true, message: 'Candidate converted to employee successfully' };
  }

  private async validate(params: Params): Promise<{ candidate: CandidateRecord; org: OrganizationRecord }> {
    const candidate = await this.candidateDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!candidate) {
      throw new ApiBadRequestError('Candidate not found');
    }

    if (candidate.employeeId) {
      throw new ApiBadRequestError('Candidate has already been converted to an employee');
    }

    // Validate candidate has required personal fields
    if (!candidate.dob) {
      throw new ApiBadRequestError('Candidate date of birth is required. Please update the candidate first.');
    }

    // Check for duplicates
    const duplicateCode = await this.employeeDao.findByEmployeeCode({ employeeCode: params.dto.employeeCode, organizationId: params.currentUser.organizationId });
    if (duplicateCode) throw new ApiFieldValidationError('employeeCode', 'Employee code already exists');

    if (candidate.pan) {
      const duplicatePan = await this.employeeDao.findByPan({ pan: candidate.pan, organizationId: params.currentUser.organizationId });
      if (duplicatePan) throw new ApiBadRequestError('PAN already registered as an employee');
    }
    if (candidate.aadhaar) {
      const duplicateAadhaar = await this.employeeDao.findByAadhaar({ aadhaar: candidate.aadhaar, organizationId: params.currentUser.organizationId });
      if (duplicateAadhaar) throw new ApiBadRequestError('Aadhaar already registered as an employee');
    }

    const org = await this.organizationDao.findById({ id: params.currentUser.organizationId });
    if (!org) {
      throw new ApiBadRequestError('Organization not found');
    }

    return { candidate, org };
  }

  private async ensureUser(candidate: CandidateRecord, existingUser: ExistingUserRecord, tx: Prisma.TransactionClient): Promise<number> {
    if (existingUser) {
      return existingUser.id;
    }
    const randomPassword = this.passwordService.makeRandomKey();
    const hashedPassword = await this.passwordService.hash(randomPassword);
    return await this.userDao.create({
      data: {
        email: candidate.email,
        firstname: candidate.firstname,
        lastname: candidate.lastname,
        password: hashedPassword,
        isActive: false,
      },
      tx,
    });
  }

  private async createEmployee(params: Params, candidate: CandidateRecord, userId: number, tx: Prisma.TransactionClient): Promise<number> {
    const dateOfJoining = new Date(params.dto.dateOfJoining);
    return await this.employeeDao.create({
      data: {
        user: { connect: { id: userId } },
        organization: { connect: { id: params.currentUser.organizationId } },
        candidate: { connect: { id: candidate.id } },
        employeeCode: params.dto.employeeCode,
        dob: candidate.dob!,
        pan: candidate.pan ?? undefined,
        aadhaar: candidate.aadhaar ?? undefined,
        designation: params.dto.designation,
        dateOfJoining,
        status: 'active',
        emergencyContactName: params.dto.emergencyContactName,
        emergencyContactNumber: params.dto.emergencyContactNumber,
        emergencyContactRelationship: params.dto.emergencyContactRelationship,
      },
      tx,
    });
  }

  private async createLeaveCounter(params: Params, userId: number, tx: Prisma.TransactionClient): Promise<void> {
    const dateOfJoining = new Date(params.dto.dateOfJoining);
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
  }

  private async upsertOrgUser(params: Params, userId: number, tx: Prisma.TransactionClient): Promise<void> {
    await this.organizationHasUserDao.upsert({
      organizationId: params.currentUser.organizationId,
      userId,
      roles: [UserRoleDbEnum.employee],
      tx,
    });
  }

  private async createInvite(params: Params, userId: number, tx: Prisma.TransactionClient): Promise<string> {
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

  private async linkEmployeeToCandidate(params: Params, candidateId: number, employeeId: number, tx: Prisma.TransactionClient): Promise<void> {
    await this.candidateDao.update({
      id: candidateId,
      organizationId: params.currentUser.organizationId,
      data: { status: 'selected', employee: { connect: { id: employeeId } } },
      tx,
    });
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
    } catch {
      this.logger.e('Failed to send invite email after candidate conversion');
    }
  }
}
