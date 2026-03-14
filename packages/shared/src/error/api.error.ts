import { ZodError } from 'zod';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly reportToSentry: boolean;
  public readonly extra?: Record<string, unknown>;

  constructor(message: string, statusCode: number, options?: { reportToSentry?: boolean; extra?: Record<string, unknown> }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.reportToSentry = options?.reportToSentry ?? true;
    this.extra = options?.extra;
  }
}


export class ApiZodValidationError extends Error {
  public errors: ZodError;
  public statusCode: number;

  constructor(errors: ZodError) {
    super('Validation failed');
    this.name = 'ApiZodValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

export class ApiFieldValidationError extends Error {
  public field: string;
  public statusCode: number;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'ApiFieldValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

export class ApiBadRequestError extends ApiError {
  constructor(message: string, extra?: Record<string, unknown>) {
    super(message, 400, { reportToSentry: false, extra });
    this.name = 'ApiBadRequestError';
  }
}
