import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

import { CommonLoggerService } from '../logger/logger.service.js';

@Catch()
export class UnknownExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CommonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      this.logger.e('Unhandled exception', { error: exception.message, stack: exception.stack });
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
