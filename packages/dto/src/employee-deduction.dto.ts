import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

export const UserEmployeeDeductionTypeDtoEnum = ['providentFund', 'incomeTax', 'insurance', 'professionalTax', 'loan', 'other'] as const;
export type UserEmployeeDeductionTypeDtoEnum = (typeof UserEmployeeDeductionTypeDtoEnum)[number];

export const UserEmployeeDeductionFrequencyDtoEnum = ['monthly', 'yearly', 'specificMonth'] as const;
export type UserEmployeeDeductionFrequencyDtoEnum = (typeof UserEmployeeDeductionFrequencyDtoEnum)[number];

export const EmployeeDeductionFilterRequestSchema = FilterRequestSchema.extend({
  employeeId: z.number(),
});
export type EmployeeDeductionFilterRequestType = z.infer<typeof EmployeeDeductionFilterRequestSchema>;

const emptyStringToUndefined = (val: unknown) => (val === '' ? undefined : val);

export const EmployeeDeductionCreateRequestSchema = z
  .object({
    employeeId: z.number(),
    type: z.enum(UserEmployeeDeductionTypeDtoEnum),
    frequency: z.enum(UserEmployeeDeductionFrequencyDtoEnum),
    amount: z.number().min(0),
    otherTitle: z.preprocess(emptyStringToUndefined, z.string().optional().nullable()),
    specificMonth: z.preprocess(emptyStringToUndefined, z.string().optional().nullable()),
    effectiveFrom: z.string(),
    effectiveTill: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.type !== 'other' || (data.otherTitle != null && data.otherTitle.trim().length > 0), {
    message: 'Title is required when type is Other',
    path: ['otherTitle'],
  })
  .refine((data) => data.frequency !== 'specificMonth' || (data.specificMonth != null && typeof data.specificMonth === 'string' && data.specificMonth.trim().length > 0), {
    message: 'Specific month date is required when frequency is Specific Month',
    path: ['specificMonth'],
  });
export type EmployeeDeductionCreateRequestType = z.infer<typeof EmployeeDeductionCreateRequestSchema>;

export const EmployeeDeductionUpdateRequestSchema = z
  .object({
    type: z.enum(UserEmployeeDeductionTypeDtoEnum).optional(),
    frequency: z.enum(UserEmployeeDeductionFrequencyDtoEnum).optional(),
    amount: z.number().min(0).optional(),
    otherTitle: z.preprocess(emptyStringToUndefined, z.string().optional().nullable()),
    specificMonth: z.preprocess(emptyStringToUndefined, z.string().optional().nullable()),
    effectiveFrom: z.string().optional(),
    effectiveTill: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.type === undefined) return true;
      return data.type !== 'other' || (data.otherTitle != null && data.otherTitle.trim().length > 0);
    },
    { message: 'Title is required when type is Other', path: ['otherTitle'] },
  )
  .refine(
    (data) => {
      if (data.frequency === undefined) return true;
      return data.frequency !== 'specificMonth' || (data.specificMonth != null && typeof data.specificMonth === 'string' && data.specificMonth.trim().length > 0);
    },
    { message: 'Specific month date is required when frequency is Specific Month', path: ['specificMonth'] },
  );
export type EmployeeDeductionUpdateRequestType = z.infer<typeof EmployeeDeductionUpdateRequestSchema>;

export const EmployeeDeductionResponseSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  type: z.enum(UserEmployeeDeductionTypeDtoEnum),
  frequency: z.enum(UserEmployeeDeductionFrequencyDtoEnum),
  amount: z.number(),
  otherTitle: z.string().optional().nullable(),
  specificMonth: z.string().optional().nullable(),
  effectiveFrom: z.string(),
  effectiveTill: z.string().optional().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type EmployeeDeductionResponseType = z.infer<typeof EmployeeDeductionResponseSchema>;
