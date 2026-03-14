import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApiZodValidationError } from '@repo/shared';
import type { Response } from 'express';

@Catch(ApiZodValidationError)
export class ApiZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ApiZodValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
      errors: exception.errors.flatten().fieldErrors,
    });
  }
}
