import { z } from 'zod';

export const OperationStatusResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});
export type OperationStatusResponseType = z.infer<typeof OperationStatusResponseSchema>;

export const PaginationRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;
