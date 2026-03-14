import type { INestApplication } from '@nestjs/common';
import { ApiExceptionFilter, ApiFieldValidationExceptionFilter, ApiZodValidationExceptionFilter, CommonLoggerService, CommonLoggingInterceptor, QueryContextInterceptor, TimeoutInterceptor, UnknownExceptionFilter } from '@repo/nest-lib';

export function setup(app: INestApplication) {
  const logger = app.get(CommonLoggerService);

  app.useGlobalInterceptors(new TimeoutInterceptor(), new QueryContextInterceptor(), new CommonLoggingInterceptor(logger));

  app.useGlobalFilters(new UnknownExceptionFilter(logger), new ApiExceptionFilter(), new ApiFieldValidationExceptionFilter(), new ApiZodValidationExceptionFilter());
}
