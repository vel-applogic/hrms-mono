import { z } from 'zod';

import { ExpenseTypeDtoEnum } from './enum.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

const ExpenseBaseFieldsSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').trim(),
  type: z.enum(ExpenseTypeDtoEnum),
  amount: z.number().min(0, 'Amount must be non-negative'),
});

export const ExpenseCreateRequestSchema = ExpenseBaseFieldsSchema;
export type ExpenseCreateRequestType = z.infer<typeof ExpenseCreateRequestSchema>;

export const ExpenseUpdateRequestSchema = ExpenseBaseFieldsSchema.extend({
  id: z.number(),
});
export type ExpenseUpdateRequestType = z.infer<typeof ExpenseUpdateRequestSchema>;

export const ExpenseResponseSchema = ExpenseBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ExpenseResponseType = z.infer<typeof ExpenseResponseSchema>;

export const ExpenseSummaryResponseSchema = z.object({
  thisMonthTotal: z.number(),
  financialYearTotal: z.number(),
});
export type ExpenseSummaryResponseType = z.infer<typeof ExpenseSummaryResponseSchema>;

export const ExpenseFilterRequestSchema = FilterRequestSchema.extend({
  types: z.array(z.enum(ExpenseTypeDtoEnum)).optional(),
  dateStartDate: z.string().optional(),
  dateEndDate: z.string().optional(),
});
export type ExpenseFilterRequestType = z.infer<typeof ExpenseFilterRequestSchema>;
