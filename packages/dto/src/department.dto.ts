import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

const DepartmentBaseFieldsSchema = z.object({
  name: z.string().min(1, 'Department name is required').trim(),
});

export const DepartmentCreateRequestSchema = DepartmentBaseFieldsSchema.extend({});
export type DepartmentCreateRequestType = z.infer<typeof DepartmentCreateRequestSchema>;

export const DepartmentUpdateRequestSchema = DepartmentBaseFieldsSchema.extend({
  id: z.number(),
});
export type DepartmentUpdateRequestType = z.infer<typeof DepartmentUpdateRequestSchema>;

export const DepartmentResponseSchema = DepartmentBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DepartmentResponseType = z.infer<typeof DepartmentResponseSchema>;

export const DepartmentSortableColumns = ['name', 'createdAt', 'updatedAt'] as const;

export const DepartmentFilterRequestSchema = FilterRequestSchema.extend({});
export type DepartmentFilterRequestType = z.infer<typeof DepartmentFilterRequestSchema>;
