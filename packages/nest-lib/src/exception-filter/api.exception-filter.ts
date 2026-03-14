import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApiError } from '@repo/shared';
import type { Response } from 'express';

@Catch(ApiError)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: ApiError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
    });
  }
}
