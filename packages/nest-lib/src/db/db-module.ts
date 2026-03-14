import { Global, Module } from '@nestjs/common';

import { CommonLoggerService } from '../logger/logger.service.js';
import {
  CandidateDao,
  CandidateHasMediaDao,
  CandidateHasFeedbackDao,
  MediaDao,
  PolicyDao,
  PolicyHasMediaDao,
  UserDao,
  UserPlanHistoryDao,
} from './dao/index.js';
import { PrismaService } from './prisma/prisma.service.js';
import { AuditService } from '../service/audit.service.js';
import { AuditActivityDao } from './dao/audit-activity.dao.js';
import { AuditActivityHasEntityDao } from './dao/audit-activity-has-entity.dao.js';
import { UserVerifyEmailDao } from './dao/user-verify-email.dao.js';
import { UserForgotPasswordDao } from './dao/user-forgot-password.dao.js';

@Global()
@Module({
  providers: [
    PrismaService,
    AuditService,
    UserDao,
    UserPlanHistoryDao,
    MediaDao,
    CandidateDao,
    CandidateHasMediaDao,
    CandidateHasFeedbackDao,
    PolicyDao,
    PolicyHasMediaDao,
    CommonLoggerService,
    AuditActivityDao,
    AuditActivityHasEntityDao,
    UserForgotPasswordDao,
    UserVerifyEmailDao,
  ],
  exports: [
    PrismaService,
    AuditService,
    UserDao,
    UserPlanHistoryDao,
    MediaDao,
    CandidateDao,
    CandidateHasMediaDao,
    CandidateHasFeedbackDao,
    PolicyDao,
    PolicyHasMediaDao,
    CommonLoggerService,
    AuditActivityDao,
    AuditActivityHasEntityDao,
    UserForgotPasswordDao,
    UserVerifyEmailDao,
  ],
})
export class CommonDbModule {}
