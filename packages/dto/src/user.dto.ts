import { z } from 'zod';

import { UserRoleDtoEnum } from './enum.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const UserBaseFieldsSchema = z.object({
  email: z.string().email(),
  firstname: z.string(),
  lastname: z.string(),
  roles: z.array(z.enum(UserRoleDtoEnum)),
});

export const AdminUserCreateRequestSchema = z.object({
  email: z.string().email(),
});
export type AdminUserCreateRequestType = z.infer<typeof AdminUserCreateRequestSchema>;

export const AdminUserUpdateRequestSchema = z.object({
  firstname: z.string().min(1).optional(),
  lastname: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});
export type AdminUserUpdateRequestType = z.infer<typeof AdminUserUpdateRequestSchema>;

export const AdminUserListResponseSchema = UserBaseFieldsSchema.extend({
  id: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminUserListResponseType = z.infer<typeof AdminUserListResponseSchema>;

export const AdminUserDetailResponseSchema = UserBaseFieldsSchema.extend({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminUserDetailResponseType = z.infer<typeof AdminUserDetailResponseSchema>;

export const AdminUserStatsResponseSchema = z.object({
  totalUsers: z.number(),
});
export type AdminUserStatsResponseType = z.infer<typeof AdminUserStatsResponseSchema>;

export const AdminUsersSortableColumns = ['firstname', 'lastname', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'] as const;

export const UserFilterRequestSchema = FilterRequestSchema.extend({
  role: z.enum(UserRoleDtoEnum).optional(),
  isActive: z.boolean().optional(),
});
export type UserFilterRequestType = z.infer<typeof UserFilterRequestSchema>;

export const UserMinResponseSchema = UserBaseFieldsSchema.extend({
  id: z.number(),
});
export type UserMinResponseType = z.infer<typeof UserMinResponseSchema>;
