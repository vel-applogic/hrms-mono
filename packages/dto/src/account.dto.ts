import { z } from 'zod';

import { AuthPasswordValidationSchema } from './auth.dto.js';

export const AccountUpdateProfileRequestSchema = z.object({
  firstname: z.string().min(1, 'First name is required').max(100),
  lastname: z.string().min(1, 'Last name is required').max(100),
});
export type AccountUpdateProfileRequestType = z.infer<typeof AccountUpdateProfileRequestSchema>;

export const AccountUpdateProfileResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstname: z.string(),
  lastname: z.string(),
});
export type AccountUpdateProfileResponseType = z.infer<typeof AccountUpdateProfileResponseSchema>;

export const AccountChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: AuthPasswordValidationSchema('New password'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type AccountChangePasswordRequestType = z.infer<typeof AccountChangePasswordRequestSchema>;
