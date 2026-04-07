import { Injectable } from '@nestjs/common';
import type { AuthLoginRequestType, AuthLoginResponseType } from '@repo/dto';
import { CommonLoggerService, IUseCase, OrganizationHasUserDao, UserDao, userRoleDbEnumToDtoEnum, UserVerifyEmailDao } from '@repo/nest-lib';
import type { UserSelectTableRecordType } from '@repo/nest-lib';
import { ApiBadRequestError, ApiError } from '@repo/shared';


import { PasswordService } from '../../../service/password.service.js';

type Params = {
  dto: AuthLoginRequestType;
};

@Injectable()
export class AuthLoginUc implements IUseCase<Params, AuthLoginResponseType> {
  constructor(
    private readonly userDao: UserDao,
    private readonly userVerifyEmailDao: UserVerifyEmailDao,
    private readonly organizationHasUserDao: OrganizationHasUserDao,
    private readonly passwordService: PasswordService,
    private readonly logger: CommonLoggerService,
  ) {}

  public async execute(params: Params): Promise<AuthLoginResponseType> {
    this.logger.i('Login attempt', { email: params.dto.email });
    const { user } = await this.validate(params);
    return await this.login(user);
  }

  private async validate(params: Params): Promise<{ user: UserSelectTableRecordType }> {
    const user = await this.userDao.getByEmail({ email: params.dto.email.toLowerCase() });
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }

    const isPasswordValid = await this.passwordService.compare(params.dto.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      const hasPending = await this.userVerifyEmailDao.hasPendingVerification({ userId: user.id });
      if (hasPending) {
        throw new ApiBadRequestError('Email is not verified');
      }
      throw new ApiBadRequestError('Account is disabled');
    }

    return { user };
  }

  private async login(user: UserSelectTableRecordType): Promise<AuthLoginResponseType> {
    const orgMemberships = await this.organizationHasUserDao.findAllByUserWithOrganization({ userId: user.id });
    const primaryMembership = orgMemberships[0];
    const roles = primaryMembership?.roles.map((r) => userRoleDbEnumToDtoEnum(r)) ?? [];

    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      isSuperAdmin: user.isSuperAdmin,
      organisations: orgMemberships.map((m) => ({ id: m.organizationId, name: m.organization.name })),
      roles,
    };
  }
}
