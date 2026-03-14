import { z } from 'zod';

export type APIErrorContext = {
  url?: string;
  method?: string;
  requestId?: string;
  body?: unknown;
};

export class APIError extends Error {
  statusCode: number;
  validationErrors?: ApiValidationIssueType[];
  context?: APIErrorContext;

  constructor(statusCode: number, message: string, validationErrors?: ApiValidationIssueType[], context?: APIErrorContext) {
    super(message);
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    this.context = context;
  }
}

export class UnAuthenticatedError {
  generalError: string;
  constructor(error: string) {
    this.generalError = error;
  }
}

const ApiValidationIssueSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
});

export type ApiValidationIssueType = z.infer<typeof ApiValidationIssueSchema>;

export const ValidationErrorZodSchema = z.object({
  errors: z.array(ApiValidationIssueSchema),
});

export const APIErrorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  validationErrors: z.array(ApiValidationIssueSchema).optional(),
});
