import { Injectable } from '@nestjs/common';
import { CommonLoggerService } from '@repo/nest-lib';
import { createTransport, SentMessageInfo, Transporter } from 'nodemailer';

import { AppConfigService } from '#src/config/app-config.service.js';

import { ForgotPasswordRequestEmailDto, UserActivationRequestEmailDto, UserInviteEmailDto } from './email.dto.js';
import { EMAIL_TEMPLATE_MAP, EmailTemplateName } from './email-templates.js';

@Injectable()
export class EmailService {
  private transport: Transporter;
  private emailLogoUrl: string;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly logger: CommonLoggerService,
  ) {
    const options = {
      host: this.appConfigService.mailHost,
      port: this.appConfigService.mailPort,
      secure: false, //this.appConfigService.mailSecure,
      tls: {
        rejectUnauthorized: false, //this.appConfigService.mailSecure ? true : false,
      },
      auth: {
        user: this.appConfigService.mailUser,
        pass: this.appConfigService.mailPassword,
      },
      logger: this.appConfigService.appEnv !== 'test' ? true : false,
    } as Parameters<typeof createTransport>[0];
    this.transport = createTransport(options);
    this.emailLogoUrl = this.appConfigService.webAppBaseUrl + '/logo/logo-email.png';
  }

  public async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transport.verify();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  public async sendForgotPasswordRequestEmail(params: { userId: number; email: string; emailData: ForgotPasswordRequestEmailDto }): Promise<void> {
    await this.sendEmail<ForgotPasswordRequestEmailDto>({
      userId: params.userId,
      subject: 'Forgot password requested',
      email: params.email,
      emailData: params.emailData,
      emailTemplateName: 'SEND_FORGOT_PASSWORD_LINK_TEMPLATE',
    });
  }

  public async sendUserInvite(params: { userId: number; email: string; emailData: UserInviteEmailDto }): Promise<void> {
    await this.sendEmail<UserInviteEmailDto>({
      userId: params.userId,
      subject: `You've been invited to ${params.emailData.organizationName}`,
      email: params.email,
      emailData: params.emailData,
      emailTemplateName: 'SEND_USER_INVITE_TEMPLATE',
    });
  }

  public async sendUserEmailVerifyRequest(params: { userId: number; email: string; emailData: ForgotPasswordRequestEmailDto }): Promise<void> {
    await this.sendEmail<UserActivationRequestEmailDto>({
      userId: params.userId,
      subject: 'Please verify your email',
      email: params.email,
      emailData: params.emailData,
      emailTemplateName: 'SEND_USER_EMAIL_VERIFY_TEMPLATE',
    });
  }

  private isEmailAllowed(email: string): boolean {
    const normalizedEmail = email.toLowerCase();

    // FIXME: Add allowed emails and domains if needed
    // // Check allowed emails first
    // const allowedEmails = this.appConfigService.mailAllowedEmails;
    // if (allowedEmails.includes(normalizedEmail)) {
    //   return true;
    // }

    // // Then check allowed domains
    // const allowedDomains = this.appConfigService.mailAllowedDomains;
    // if (allowedDomains.length === 0) {
    //   return true;
    // }

    const emailDomain = normalizedEmail.split('@')[1];
    if (!emailDomain) {
      return false;
    }

    // return allowedDomains.includes(emailDomain);
    return true;
  }

  private async sendEmail<T>(params: {
    userId: number;
    subject: string;
    email: string;
    emailData: T;
    emailTemplateName: EmailTemplateName;
    attachments?: Array<{
      filename: string;
      content: Buffer;
    }>;
  }): Promise<void> {
    this.logger.i('sending email', { email: params.email, subject: params.subject, emailData: params.emailData });

    let sentStatus: SentMessageInfo | { status: string; msg: string };

    // Check if email is allowed
    if (!this.isEmailAllowed(params.email)) {
      const emailDomain = params.email.split('@')[1];
      sentStatus = {
        status: 'skipped',
        msg: `Email '${params.email}' is not in the allowed emails or domains list`,
      };
      this.logger.i('email skipped - not allowed', {
        email: params.email,
        subject: params.subject,
        emailDomain,
        sentStatus,
      });
    } else {
      const templateFunction = EMAIL_TEMPLATE_MAP[params.emailTemplateName];
      const html = templateFunction({ ...params.emailData, currentYear: new Date().getFullYear().toString(), emailLogoUrl: this.emailLogoUrl });

      sentStatus = await this.transport.sendMail({
        from: this.appConfigService.mailNoReply,
        to: params.email,
        subject: params.subject,
        html: html,
        attachments: params.attachments,
      });

      this.logger.i('sent email response', { email: params.email, subject: params.subject, emailData: params.emailData, sentStatus });
    }

    // const organisationId = await this.userDao.getOrganisationIdByUserId({ userId: params.userId });

    // await this.auditEmailDao.create({
    //   data: {
    //     user: { connect: { id: params.userId } },
    //     // organisation: organisationId ? { connect: { id: organisationId } } : undefined,
    //     email: params.email,
    //     subject: params.subject,
    //     template: params.emailTemplateName,
    //     emailData: params.emailData as any,
    //     sentStatus: sentStatus as any,
    //     status: status,
    //   },
    // });
  }
}
