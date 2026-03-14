import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApiFieldValidationError } from '@repo/shared';
import type { Response } from 'express';

@Catch(ApiFieldValidationError)
export class ApiFieldValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ApiFieldValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
      field: exception.field,
    });
  }
}
