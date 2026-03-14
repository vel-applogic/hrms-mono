import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommonDbModule, CommonLoggerModule } from '@repo/nest-lib';

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
import { ChapterModule } from './module/chapter/chapter.module.js';
import { FlashcardModule } from './module/flashcard/flashcard.module.js';
import { MediaModule } from './module/media/media.module.js';
import { QuestionModule } from './module/question/question.module.js';
import { SeederModule } from './module/seeder/seeder.module.js';
import { PolicyModule } from './module/policy/policy.module.js';
import { SlideModule } from './module/slide/slide.module.js';
import { ThemeModule } from './module/theme/theme.module.js';
import { TopicModule } from './module/topic/topic.module.js';
import { ServiceModule } from './service/service.module.js';

@Module({
  imports: [
    CommonLoggerModule.forRoot(),
    AppConfigModule,
    CommonDbModule,
    ServiceModule,
    AuthModule,
    AppStatusModule,
    AccountModule,
    AdminUserModule,
    ChapterModule,
    CandidateModule,
    ThemeModule,
    TopicModule,
    PolicyModule,
    SlideModule,
    FlashcardModule,
    QuestionModule,
    SeederModule,
    ExternalServiceModule,
    MediaModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SetRequestIdMiddleware).forRoutes('*');
    consumer.apply(AuthenticateMiddleware).forRoutes('*');
    consumer.apply(AdminUserMiddleware).exclude('app/status', 'auth/{*path}').forRoutes('*');
  }
}
