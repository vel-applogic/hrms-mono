import { z } from 'zod';

export const PlanBaseFieldsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
});

export const PlanCreateRequestSchema = PlanBaseFieldsSchema.extend({});
export type PlanCreateRequestType = z.infer<typeof PlanCreateRequestSchema>;

export const PlanUpdateRequestSchema = PlanBaseFieldsSchema.extend({});
export type PlanUpdateRequestType = z.infer<typeof PlanUpdateRequestSchema>;

export const PlanListResponseSchema = PlanBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PlanListResponseType = z.infer<typeof PlanListResponseSchema>;

export const PlanDetailResponseSchema = PlanBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PlanDetailResponseType = z.infer<typeof PlanDetailResponseSchema>;

export const PlanSortableColumns = ['name', 'price', 'createdAt', 'updatedAt'] as const;
