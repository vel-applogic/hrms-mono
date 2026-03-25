import { Body, Controller, Post } from '@nestjs/common';
import type {
  AuthAcceptInviteRequestType,
  AuthForgotPasswordRequestType,
  AuthLoginRequestType,
  AuthLoginResponseType,
  AuthResetPasswordRequestType,
  AuthVerifyEmailRequestType,
  OperationStatusResponseType,
} from '@repo/dto';
import {
  AuthAcceptInviteRequestSchema,
  AuthForgotPasswordRequestSchema,
  AuthLoginRequestSchema,
  AuthResetPasswordRequestSchema,
  AuthVerifyEmailRequestSchema,
} from '@repo/dto';
import { ZodValidationPipe } from '@repo/nest-lib';

import { AuthAcceptInviteUc } from './uc/auth-accept-invite.uc.js';
import { AuthForgotPasswordUseCase } from './uc/auth-forgot-password.uc.js';
import { AuthLoginUc } from './uc/auth-login.uc.js';
import { AuthResetPasswordUseCase } from './uc/auth-reset-password.uc.js';
import { AuthVerifyEmailUseCase } from './uc/auth-verify-email.uc.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authLoginUc: AuthLoginUc,
    private readonly authForgotPasswordUc: AuthForgotPasswordUseCase,
    private readonly authResetPasswordUc: AuthResetPasswordUseCase,
    private readonly authVerifyEmailUc: AuthVerifyEmailUseCase,
    private readonly authAcceptInviteUc: AuthAcceptInviteUc,
  ) {}

  @Post('login')
  async login(@Body(new ZodValidationPipe(AuthLoginRequestSchema)) body: AuthLoginRequestType): Promise<AuthLoginResponseType> {
    return this.authLoginUc.execute({ dto: body });
  }

  @Post('/forgot-password')
  public async forgotPassword(@Body(new ZodValidationPipe(AuthForgotPasswordRequestSchema)) dto: AuthForgotPasswordRequestType): Promise<OperationStatusResponseType> {
    return await this.authForgotPasswordUc.execute({ dto });
  }

  @Post('/reset-password')
  public async resetPassword(@Body(new ZodValidationPipe(AuthResetPasswordRequestSchema)) dto: AuthResetPasswordRequestType): Promise<OperationStatusResponseType> {
    return await this.authResetPasswordUc.execute({ dto });
  }

  @Post('/verify-email')
  public async verifyEmail(@Body(new ZodValidationPipe(AuthVerifyEmailRequestSchema)) dto: AuthVerifyEmailRequestType): Promise<OperationStatusResponseType> {
    return await this.authVerifyEmailUc.execute({ dto });
  }

  @Post('/accept-invite')
  public async acceptInvite(@Body(new ZodValidationPipe(AuthAcceptInviteRequestSchema)) dto: AuthAcceptInviteRequestType): Promise<OperationStatusResponseType> {
    return await this.authAcceptInviteUc.execute({ dto });
  }
}
