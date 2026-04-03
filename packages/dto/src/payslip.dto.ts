import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

export const PayrollPayslipLineItemTypeDtoEnum = ['earning', 'deduction'] as const;
export type PayrollPayslipLineItemTypeDtoEnum = (typeof PayrollPayslipLineItemTypeDtoEnum)[number];

export const PayslipFilterRequestSchema = FilterRequestSchema.extend({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100).optional(),
  employeeIds: z.array(z.number()).optional(),
});
export type PayslipFilterRequestType = z.infer<typeof PayslipFilterRequestSchema>;

export const PayslipGenerateRequestSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  employeeIds: z.array(z.number()).optional(),
  force: z.boolean().optional(),
});
export type PayslipGenerateRequestType = z.infer<typeof PayslipGenerateRequestSchema>;

export const PayslipLineItemResponseSchema = z.object({
  id: z.number(),
  payslipId: z.number(),
  type: z.enum(PayrollPayslipLineItemTypeDtoEnum),
  title: z.string(),
  amount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PayslipLineItemResponseType = z.infer<typeof PayslipLineItemResponseSchema>;

export const PayslipListResponseSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  employeeFirstname: z.string(),
  employeeLastname: z.string(),
  employeeEmail: z.string(),
  month: z.number(),
  year: z.number(),
  grossAmount: z.number(),
  netAmount: z.number(),
  deductionAmount: z.number(),
  pdfSignedUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PayslipListResponseType = z.infer<typeof PayslipListResponseSchema>;

export const PayslipDetailResponseSchema = PayslipListResponseSchema.extend({
  employeeDesignation: z.string(),
  companyName: z.string(),
  companyLogoUrl: z.string().nullable(),
  lineItems: z.array(PayslipLineItemResponseSchema),
});
export type PayslipDetailResponseType = z.infer<typeof PayslipDetailResponseSchema>;

export const PayslipGenerateResponseSchema = z.object({
  generated: z.number(),
  skipped: z.number(),
  alreadyExisting: z.boolean(),
  existingPayslips: z.array(PayslipListResponseSchema).optional(),
});
export type PayslipGenerateResponseType = z.infer<typeof PayslipGenerateResponseSchema>;

export const PayslipLineItemUpsertSchema = z.object({
  type: z.enum(PayrollPayslipLineItemTypeDtoEnum),
  title: z.string().min(1),
  amount: z.number().min(0),
});
export type PayslipLineItemUpsertType = z.infer<typeof PayslipLineItemUpsertSchema>;

export const PayslipUpdateLineItemsRequestSchema = z.object({
  lineItems: z.array(PayslipLineItemUpsertSchema).min(1),
});
export type PayslipUpdateLineItemsRequestType = z.infer<typeof PayslipUpdateLineItemsRequestSchema>;
