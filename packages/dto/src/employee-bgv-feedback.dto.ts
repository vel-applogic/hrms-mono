import { z } from 'zod';

import { MediaResponseSchema, MediaUpsertSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const EmployeeBgvFeedbackFilterRequestSchema = FilterRequestSchema.extend({
  employeeId: z.number(),
});
export type EmployeeBgvFeedbackFilterRequestType = z.infer<typeof EmployeeBgvFeedbackFilterRequestSchema>;

export const EmployeeBgvFeedbackCreateRequestSchema = z.object({
  employeeId: z.number(),
  feedback: z.string().min(1),
  files: z.array(MediaUpsertSchema).optional(),
});
export type EmployeeBgvFeedbackCreateRequestType = z.infer<typeof EmployeeBgvFeedbackCreateRequestSchema>;

export const EmployeeBgvFeedbackUpdateRequestSchema = z.object({
  feedback: z.string().min(1),
});
export type EmployeeBgvFeedbackUpdateRequestType = z.infer<typeof EmployeeBgvFeedbackUpdateRequestSchema>;

export const EmployeeBgvFeedbackResponseSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  feedback: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  files: z.array(MediaResponseSchema),
});
export type EmployeeBgvFeedbackResponseType = z.infer<typeof EmployeeBgvFeedbackResponseSchema>;
