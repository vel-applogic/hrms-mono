import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AdminOnlyGuard, CommonDbModule, CommonLoggerModule } from '@repo/nest-lib';

import { AppConfigModule } from './config/app-config.module.js';
import { ExternalServiceModule } from './external-service/external-service.module.js';
import { AuthenticateMiddleware } from './middleware/authenticate.middleware.js';
import { SetRequestIdMiddleware } from './middleware/set-request-id.middleware.js';
import { AdminUserMiddleware } from './middleware/user-role.middleware.js';
import { AccountModule } from './module/account/account.module.js';
import { AdminUserModule } from './module/admin-user/admin-user.module.js';
import { AppStatusModule } from './module/app-status/app-status.module.js';
import { AuthModule } from './module/auth/auth.module.js';
import { CandidateModule } from './module/candidate/candidate.module.js';
import { CandidateFeedbackModule } from './module/candidate-feedback/candidate-feedback.module.js';
import { EmployeeModule } from './module/employee/employee.module.js';
import { EmployeeFeedbackModule } from './module/employee-feedback/employee-feedback.module.js';
import { EmployeeBgvFeedbackModule } from './module/employee-bgv-feedback/employee-bgv-feedback.module.js';
import { EmployeeCompensationModule } from './module/employee-compensation/employee-compensation.module.js';
import { EmployeeDeductionModule } from './module/employee-deduction/employee-deduction.module.js';
import { PayslipModule } from './module/payslip/payslip.module.js';
import { LeaveModule } from './module/leave/leave.module.js';
import { MediaModule } from './module/media/media.module.js';
import { OrganizationModule } from './module/organization/organization.module.js';
import { HolidayModule } from './module/holiday/holiday.module.js';
import { SeederModule } from './module/seeder/seeder.module.js';
import { DeviceModule } from './module/device/device.module.js';
import { ExpenseModule } from './module/expense/expense.module.js';
import { PolicyModule } from './module/policy/policy.module.js';
import { ServiceModule } from './service/service.module.js';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AdminOnlyGuard,
    },
  ],
  imports: [
    CommonLoggerModule.forRoot(),
    AppConfigModule,
    CommonDbModule,
    ServiceModule,
    AuthModule,
    AppStatusModule,
    AccountModule,
    AdminUserModule,
    CandidateModule,
    CandidateFeedbackModule,
    EmployeeModule,
    EmployeeFeedbackModule,
    EmployeeBgvFeedbackModule,
    EmployeeCompensationModule,
    EmployeeDeductionModule,
    PayslipModule,
    LeaveModule,
    HolidayModule,
    PolicyModule,
    DeviceModule,
    ExpenseModule,
    SeederModule,
    ExternalServiceModule,
    MediaModule,
    OrganizationModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SetRequestIdMiddleware).forRoutes('*');
    consumer.apply(AuthenticateMiddleware).forRoutes('*');
    consumer
      .apply(AdminUserMiddleware)
      .exclude(
        'app/status',
        'auth/{*path}',
        'api/leave/{*path}',
        'api/leave',
        'api/holiday/{*path}',
        'api/holiday',
        'api/employee/{*path}',
        'api/employee-compensation/{*path}',
        'api/employee-deduction/{*path}',
        'api/employee-feedback/{*path}',
        'api/payslip/{*path}',
        'api/payslip',
        'api/policy/{*path}',
        'api/policy',
        'api/media/{*path}',
        'api/media',
        'api/account/{*path}',
        'api/account',
        'api/device/{*path}',
        'api/device',
      )
      .forRoutes('*');
  }
}
