import z from 'zod';

export const FormattedValidationErrorSchema = z.record(z.string(), z.array(z.string()));
export type FormattedValidationErrorType = z.infer<typeof FormattedValidationErrorSchema>;

export type ServerError = {
  validationErrors?: FormattedValidationErrorType;
  generalError?: string;
};

export const ServerErrorTypeSchema = z.object({
  generalError: z.string(),
  validationErrors: FormattedValidationErrorSchema.optional(),
});
export type ServerErrorType = z.infer<typeof ServerErrorTypeSchema>;
