import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

const BranchBaseFieldsSchema = z.object({
  name: z.string().min(1, 'Branch name is required').trim(),
});

export const BranchCreateRequestSchema = BranchBaseFieldsSchema.extend({});
export type BranchCreateRequestType = z.infer<typeof BranchCreateRequestSchema>;

export const BranchUpdateRequestSchema = BranchBaseFieldsSchema.extend({
  id: z.number(),
});
export type BranchUpdateRequestType = z.infer<typeof BranchUpdateRequestSchema>;

export const BranchResponseSchema = BranchBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BranchResponseType = z.infer<typeof BranchResponseSchema>;

export const BranchSortableColumns = ['name', 'createdAt', 'updatedAt'] as const;

export const BranchFilterRequestSchema = FilterRequestSchema.extend({});
export type BranchFilterRequestType = z.infer<typeof BranchFilterRequestSchema>;
