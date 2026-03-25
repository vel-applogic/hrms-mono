import { Module } from '@nestjs/common';

import { ServiceModule } from '#src/service/service.module.js';

import { PasswordService } from '../../service/password.service.js';
import { AuthController } from './auth.controller.js';
import { AuthAcceptInviteUc } from './uc/auth-accept-invite.uc.js';
import { AuthForgotPasswordUseCase } from './uc/auth-forgot-password.uc.js';
import { AuthLoginUc } from './uc/auth-login.uc.js';
import { AuthResetPasswordUseCase } from './uc/auth-reset-password.uc.js';
import { AuthVerifyEmailUseCase } from './uc/auth-verify-email.uc.js';

@Module({
  imports: [ServiceModule],
  controllers: [AuthController],
  providers: [PasswordService, AuthLoginUc, AuthForgotPasswordUseCase, AuthResetPasswordUseCase, AuthVerifyEmailUseCase, AuthAcceptInviteUc],
})
export class AuthModule {}
