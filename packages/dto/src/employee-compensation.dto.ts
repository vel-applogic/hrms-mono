import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

export const EmployeeCompensationFilterRequestSchema = FilterRequestSchema.extend({
  employeeId: z.number(),
});
export type EmployeeCompensationFilterRequestType = z.infer<typeof EmployeeCompensationFilterRequestSchema>;

const EmployeeCompensationLineItemUpsertSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  amount: z.number().min(0),
});
export type EmployeeCompensationLineItemUpsertType = z.infer<typeof EmployeeCompensationLineItemUpsertSchema>;

export const EmployeeCompensationCreateRequestSchema = z.object({
  employeeId: z.number(),
  effectiveFrom: z.string(),
  effectiveTill: z.string().optional().nullable(),
  lineItems: z.array(EmployeeCompensationLineItemUpsertSchema).min(1, 'At least one line item is required'),
});
export type EmployeeCompensationCreateRequestType = z.infer<typeof EmployeeCompensationCreateRequestSchema>;

export const EmployeeCompensationUpdateRequestSchema = z.object({
  effectiveFrom: z.string().optional(),
  effectiveTill: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  lineItems: z.array(EmployeeCompensationLineItemUpsertSchema).min(1, 'At least one line item is required').optional(),
});
export type EmployeeCompensationUpdateRequestType = z.infer<typeof EmployeeCompensationUpdateRequestSchema>;

const EmployeeCompensationLineItemResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  amount: z.number(),
});
export type EmployeeCompensationLineItemResponseType = z.infer<typeof EmployeeCompensationLineItemResponseSchema>;

export const EmployeeCompensationResponseSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  grossAmount: z.number(),
  effectiveFrom: z.string(),
  effectiveTill: z.string().optional().nullable(),
  isActive: z.boolean(),
  lineItems: z.array(EmployeeCompensationLineItemResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type EmployeeCompensationResponseType = z.infer<typeof EmployeeCompensationResponseSchema>;

export const PayrollActiveCompensationFilterRequestSchema = FilterRequestSchema;
export type PayrollActiveCompensationFilterRequestType = z.infer<typeof PayrollActiveCompensationFilterRequestSchema>;

export const PayrollActiveCompensationResponseSchema = EmployeeCompensationResponseSchema.extend({
  employeeFirstname: z.string(),
  employeeLastname: z.string(),
  employeeEmail: z.string(),
});
export type PayrollActiveCompensationResponseType = z.infer<typeof PayrollActiveCompensationResponseSchema>;
