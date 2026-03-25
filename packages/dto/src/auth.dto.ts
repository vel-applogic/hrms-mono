import { z } from 'zod';

import { UserRoleDtoEnum } from './enum.js';

export const AuthLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type AuthLoginRequestType = z.infer<typeof AuthLoginRequestSchema>;

export const AuthLoginResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  organizationIds: z.array(z.number()),
  roles: z.array(z.nativeEnum(UserRoleDtoEnum)),
});
export type AuthLoginResponseType = z.infer<typeof AuthLoginResponseSchema>;

export const AuthRegisterRequestSchema = z.object({
  email: z.string().email(),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  password: z.string().min(8),
});
export type AuthRegisterRequestType = z.infer<typeof AuthRegisterRequestSchema>;

export const AuthRegisterResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  organizationIds: z.array(z.number()),
  roles: z.array(z.nativeEnum(UserRoleDtoEnum)),
});
export type AuthRegisterResponseType = z.infer<typeof AuthRegisterResponseSchema>;

export const AuthForgotPasswordRequestSchema = z.object({
  email: z.email().toLowerCase(),
});
export type AuthForgotPasswordRequestType = z.infer<typeof AuthForgotPasswordRequestSchema>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const AuthPasswordValidationSchema = (name: string) =>
  z
    .string()
    .min(1, `${name} is required`)
    .min(6, { message: `${name} have atleast 6 character` })
    .max(20, { message: `${name} have atleast 6 character` })
    .refine((password) => /[A-Z]/.test(password), {
      message: `${name} must have atleast 1 capital case`,
    })
    .refine((password) => /[a-z]/.test(password), {
      message: `${name} must have atleast 1 small case`,
    })
    .refine((password) => /[0-9]/.test(password), { message: `${name} must have atleast 1 number` })
    .refine((password) => /[!@#$%^&*]/.test(password), {
      message: `${name} must have atleast 1 speaial character`,
    });

export const AuthResetPasswordRequestSchema = z.object({
  userId: z.number(),
  key: z.string(),
  password: AuthPasswordValidationSchema('New password'),
});
export type AuthResetPasswordRequestType = z.infer<typeof AuthResetPasswordRequestSchema>;

export const AuthVerifyEmailRequestSchema = z.object({
  userId: z.number(),
  key: z.string(),
});
export type AuthVerifyEmailRequestType = z.infer<typeof AuthVerifyEmailRequestSchema>;

export const AuthAcceptInviteRequestSchema = z.object({
  userId: z.number(),
  inviteKey: z.string(),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  password: AuthPasswordValidationSchema('Password'),
});
export type AuthAcceptInviteRequestType = z.infer<typeof AuthAcceptInviteRequestSchema>;
