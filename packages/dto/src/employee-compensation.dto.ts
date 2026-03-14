import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

export const EmployeeCompensationFilterRequestSchema = FilterRequestSchema.extend({
  employeeId: z.number(),
});
export type EmployeeCompensationFilterRequestType = z.infer<typeof EmployeeCompensationFilterRequestSchema>;

export const EmployeeCompensationCreateRequestSchema = z.object({
  employeeId: z.number(),
  basic: z.number().min(0),
  hra: z.number().min(0),
  otherAllowances: z.number().min(0),
  gross: z.number().min(0),
  effectiveFrom: z.string().optional(),
  effectiveTill: z.string().optional().nullable(),
});
export type EmployeeCompensationCreateRequestType = z.infer<typeof EmployeeCompensationCreateRequestSchema>;

export const EmployeeCompensationUpdateRequestSchema = z.object({
  basic: z.number().min(0),
  hra: z.number().min(0),
  otherAllowances: z.number().min(0),
  gross: z.number().min(0),
  effectiveFrom: z.string().optional(),
  effectiveTill: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});
export type EmployeeCompensationUpdateRequestType = z.infer<typeof EmployeeCompensationUpdateRequestSchema>;

export const EmployeeCompensationResponseSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  basic: z.number(),
  hra: z.number(),
  otherAllowances: z.number(),
  gross: z.number(),
  effectiveFrom: z.string(),
  effectiveTill: z.string().optional().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type EmployeeCompensationResponseType = z.infer<typeof EmployeeCompensationResponseSchema>;
