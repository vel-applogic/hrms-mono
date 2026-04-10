import { z } from 'zod';

import { ExpenseForecastFrequencyDtoEnum, ExpenseTypeDtoEnum } from './enum.js';

const ExpenseForecastBaseFieldsSchema = z.object({
  description: z.string().trim().optional().default(''),
  type: z.enum(ExpenseTypeDtoEnum),
  amount: z.number().min(1, 'Amount must be at least 1'),
  frequency: z.enum(ExpenseForecastFrequencyDtoEnum),
});

export const ExpenseForecastResponseSchema = ExpenseForecastBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ExpenseForecastResponseType = z.infer<typeof ExpenseForecastResponseSchema>;

export const ExpenseForecastBulkItemSchema = ExpenseForecastBaseFieldsSchema.extend({
  id: z.number().optional(),
});
export type ExpenseForecastBulkItemType = z.infer<typeof ExpenseForecastBulkItemSchema>;

export const ExpenseForecastBulkSaveRequestSchema = z.object({
  items: z.array(ExpenseForecastBulkItemSchema),
});
export type ExpenseForecastBulkSaveRequestType = z.infer<typeof ExpenseForecastBulkSaveRequestSchema>;

export const ExpenseForecastSummaryResponseSchema = z.object({
  monthlyTotal: z.number(),
  yearlyTotal: z.number(),
});
export type ExpenseForecastSummaryResponseType = z.infer<typeof ExpenseForecastSummaryResponseSchema>;
