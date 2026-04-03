import { z } from 'zod';

import { HolidayTypeDtoEnum } from './enum.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const HolidayFilterRequestSchema = FilterRequestSchema.extend({
  year: z.number().optional(),
});
export type HolidayFilterRequestType = z.infer<typeof HolidayFilterRequestSchema>;

const HolidayBaseFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  date: z.string().min(1, 'Date is required'),
});

export const HolidayCreateRequestSchema = HolidayBaseFieldsSchema.extend({
  types: z.array(z.enum(HolidayTypeDtoEnum)).min(1, 'At least one type is required'),
});
export type HolidayCreateRequestType = z.infer<typeof HolidayCreateRequestSchema>;

export const HolidayUpdateRequestSchema = HolidayCreateRequestSchema.extend({
  id: z.number(),
});
export type HolidayUpdateRequestType = z.infer<typeof HolidayUpdateRequestSchema>;

export const HolidayResponseSchema = HolidayBaseFieldsSchema.extend({
  id: z.number(),
  types: z.array(z.enum(HolidayTypeDtoEnum)),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type HolidayResponseType = z.infer<typeof HolidayResponseSchema>;
