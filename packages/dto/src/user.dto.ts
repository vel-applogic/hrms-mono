import { z } from 'zod';

import { PlanDtoEnum, UserRoleDtoEnum } from './enum.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const UserBaseFieldsSchema = z.object({
  email: z.string().email(),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  role: z.nativeEnum(UserRoleDtoEnum),
});

export const AdminUserCreateRequestSchema = UserBaseFieldsSchema.extend({
  password: z.string().min(8),
});
export type AdminUserCreateRequestType = z.infer<typeof AdminUserCreateRequestSchema>;

export const AdminUserUpdateRequestSchema = AdminUserCreateRequestSchema.extend({
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});
export type AdminUserUpdateRequestType = z.infer<typeof AdminUserUpdateRequestSchema>;

export const AdminUserListResponseSchema = UserBaseFieldsSchema.extend({
  id: z.number(),
  plan: z.nativeEnum(PlanDtoEnum),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminUserListResponseType = z.infer<typeof AdminUserListResponseSchema>;

export const AdminUserDetailResponseSchema = UserBaseFieldsSchema.extend({
  id: z.number(),
  plan: z.nativeEnum(PlanDtoEnum),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminUserDetailResponseType = z.infer<typeof AdminUserDetailResponseSchema>;

export const AdminUserStatsResponseSchema = z.object({
  totalUsers: z.number(),
  premiumUsers: z.number(),
  freeUsers: z.number(),
});
export type AdminUserStatsResponseType = z.infer<typeof AdminUserStatsResponseSchema>;

export const AdminUsersSortableColumns = ['firstname', 'lastname', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'] as const;

export const UserFilterRequestSchema = FilterRequestSchema.extend({
  role: z.nativeEnum(UserRoleDtoEnum).optional(),
  plan: z.nativeEnum(PlanDtoEnum).optional(),
  isActive: z.boolean().optional(),
});
export type UserFilterRequestType = z.infer<typeof UserFilterRequestSchema>;

export const UserMinResponseSchema = UserBaseFieldsSchema.extend({
  id: z.number(),
});
export type UserMinResponseType = z.infer<typeof UserMinResponseSchema>;
