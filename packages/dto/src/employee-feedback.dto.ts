import { z } from 'zod';

import { EmployeeFeedbackTrendDtoEnum } from './enum.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const EmployeeFeedbackFilterRequestSchema = FilterRequestSchema.extend({
  employeeId: z.number(),
});
export type EmployeeFeedbackFilterRequestType = z.infer<typeof EmployeeFeedbackFilterRequestSchema>;

export const EmployeeFeedbackCreateRequestSchema = z.object({
  employeeId: z.number(),
  trend: z.nativeEnum(EmployeeFeedbackTrendDtoEnum),
  point: z.number().optional(),
  title: z.string().min(1),
  feedback: z.string().min(1),
});
export type EmployeeFeedbackCreateRequestType = z.infer<typeof EmployeeFeedbackCreateRequestSchema>;

export const EmployeeFeedbackUpdateRequestSchema = z.object({
  trend: z.nativeEnum(EmployeeFeedbackTrendDtoEnum),
  point: z.number().optional(),
  title: z.string().min(1),
  feedback: z.string().min(1),
});
export type EmployeeFeedbackUpdateRequestType = z.infer<typeof EmployeeFeedbackUpdateRequestSchema>;

export const EmployeeFeedbackResponseSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  trend: z.nativeEnum(EmployeeFeedbackTrendDtoEnum),
  point: z.number().optional().nullable(),
  title: z.string(),
  feedback: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  givenBy: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
  }),
});
export type EmployeeFeedbackResponseType = z.infer<typeof EmployeeFeedbackResponseSchema>;
