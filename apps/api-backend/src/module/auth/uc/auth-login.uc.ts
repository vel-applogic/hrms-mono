import { Injectable } from '@nestjs/common';
import type { AuthLoginRequestType, AuthLoginResponseType, UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, IUseCase, UserDao, UserVerifyEmailDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { PasswordService } from '../../../service/password.service.js';

type Params = {
  dto: AuthLoginRequestType;
};

@Injectable()
export class AuthLoginUc implements IUseCase<Params, AuthLoginResponseType> {
  constructor(
    private readonly userDao: UserDao,
    private readonly userVerifyEmailDao: UserVerifyEmailDao,
    private readonly passwordService: PasswordService,
    private readonly logger: CommonLoggerService,
  ) {}

  async execute(params: Params): Promise<AuthLoginResponseType> {
    this.logger.i('Login attempt', { email: params.dto.email });

    const user = await this.validate(params);
    return user;
  }

  async validate(params: Params): Promise<AuthLoginResponseType> {
    const user = await this.userDao.getByEmail({ email: params.dto.email });
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
        throw new ApiError('Email is not verified', 403);
      }
      throw new ApiError('Account is disabled', 403);
    }

    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role as UserRoleDtoEnum,
    };
  }
}
