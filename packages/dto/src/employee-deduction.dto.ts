import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

export const PayrollDeductionTypeDtoEnum = ['providentFund', 'incomeTax', 'insurance', 'professionalTax', 'loan', 'lop', 'other'] as const;
export type PayrollDeductionTypeDtoEnum = (typeof PayrollDeductionTypeDtoEnum)[number];

export const PayrollDeductionFrequencyDtoEnum = ['monthly', 'yearly', 'specificMonth'] as const;
export type PayrollDeductionFrequencyDtoEnum = (typeof PayrollDeductionFrequencyDtoEnum)[number];

export const EmployeeDeductionFilterRequestSchema = FilterRequestSchema.extend({
  employeeId: z.number(),
});
export type EmployeeDeductionFilterRequestType = z.infer<typeof EmployeeDeductionFilterRequestSchema>;

const emptyStringToUndefined = (val: unknown) => (val === '' ? undefined : val);

const EmployeeDeductionLineItemUpsertSchema = z
  .object({
    type: z.enum(PayrollDeductionTypeDtoEnum),
    frequency: z.enum(PayrollDeductionFrequencyDtoEnum),
    amount: z.number().min(0),
    otherTitle: z.preprocess(emptyStringToUndefined, z.string().optional().nullable()),
    specificMonth: z.preprocess(emptyStringToUndefined, z.string().optional().nullable()),
  })
  .refine((data) => data.type !== 'other' || (data.otherTitle != null && data.otherTitle.trim().length > 0), {
    message: 'Title is required when type is Other',
    path: ['otherTitle'],
  })
  .refine((data) => data.frequency !== 'specificMonth' || (data.specificMonth != null && data.specificMonth.trim().length > 0), {
    message: 'Specific month is required when frequency is Specific Month',
    path: ['specificMonth'],
  });
export type EmployeeDeductionLineItemUpsertType = z.infer<typeof EmployeeDeductionLineItemUpsertSchema>;

export const EmployeeDeductionCreateRequestSchema = z.object({
  employeeId: z.number(),
  effectiveFrom: z.string(),
  effectiveTill: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  lineItems: z.array(EmployeeDeductionLineItemUpsertSchema).min(1, 'At least one line item is required'),
});
export type EmployeeDeductionCreateRequestType = z.infer<typeof EmployeeDeductionCreateRequestSchema>;

export const EmployeeDeductionUpdateRequestSchema = z.object({
  effectiveFrom: z.string().optional(),
  effectiveTill: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  lineItems: z.array(EmployeeDeductionLineItemUpsertSchema).min(1, 'At least one line item is required').optional(),
});
export type EmployeeDeductionUpdateRequestType = z.infer<typeof EmployeeDeductionUpdateRequestSchema>;

const EmployeeDeductionLineItemResponseSchema = z.object({
  id: z.number(),
  type: z.enum(PayrollDeductionTypeDtoEnum),
  frequency: z.enum(PayrollDeductionFrequencyDtoEnum),
  amount: z.number(),
  otherTitle: z.string().optional().nullable(),
  specificMonth: z.string().optional().nullable(),
});
export type EmployeeDeductionLineItemResponseType = z.infer<typeof EmployeeDeductionLineItemResponseSchema>;

export const EmployeeDeductionResponseSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  effectiveFrom: z.string(),
  effectiveTill: z.string().optional().nullable(),
  isActive: z.boolean(),
  lineItems: z.array(EmployeeDeductionLineItemResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type EmployeeDeductionResponseType = z.infer<typeof EmployeeDeductionResponseSchema>;
