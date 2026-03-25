'use server';

import type { AuthAcceptInviteRequestType, AuthForgotPasswordRequestType, AuthResetPasswordRequestType, AuthVerifyEmailRequestType, OperationStatusResponseType } from '@repo/dto';
import axios, { AxiosError } from 'axios';

export type ActionError = { message: string; field?: string; fieldErrors?: Record<string, string[]> };
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };

function extractApiError(err: unknown, fallbackMessage: string): ActionError {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    return {
      message: typeof data?.message === 'string' ? data.message : fallbackMessage,
      field: typeof data?.field === 'string' ? data.field : undefined,
      fieldErrors: data?.errors && typeof data.errors === 'object' ? (data.errors as Record<string, string[]>) : undefined,
    };
  }
  return { message: fallbackMessage };
}

export async function forgotPassword(dto: AuthForgotPasswordRequestType): Promise<OperationStatusResponseType> {
  try {
    const response = await axios.post<OperationStatusResponseType>(
      `${process.env.BACKEND_API_URL}/auth/forgot-password`,
      dto,
    );
    return response.data;
  } catch (err) {
    const { message } = extractApiError(err, 'Something went wrong. Please try again.');
    throw new Error(message);
  }
}

export async function resetPassword(dto: AuthResetPasswordRequestType): Promise<ActionResult<OperationStatusResponseType>> {
  try {
    const response = await axios.post<OperationStatusResponseType>(
      `${process.env.BACKEND_API_URL}/auth/reset-password`,
      dto,
    );
    return { ok: true, data: response.data };
  } catch (err) {
    return { ok: false, error: extractApiError(err, 'Invalid or expired reset link. Please request a new one.') };
  }
}

export async function verifyEmail(dto: AuthVerifyEmailRequestType): Promise<ActionResult<OperationStatusResponseType>> {
  try {
    const response = await axios.post<OperationStatusResponseType>(
      `${process.env.BACKEND_API_URL}/auth/verify-email`,
      dto,
    );
    return { ok: true, data: response.data };
  } catch (err) {
    return { ok: false, error: extractApiError(err, 'Invalid or expired verification link.') };
  }
}

export async function acceptInvite(dto: AuthAcceptInviteRequestType): Promise<ActionResult<OperationStatusResponseType>> {
  try {
    const response = await axios.post<OperationStatusResponseType>(
      `${process.env.BACKEND_API_URL}/auth/accept-invite`,
      dto,
    );
    return { ok: true, data: response.data };
  } catch (err) {
    return { ok: false, error: extractApiError(err, 'Invalid or expired invite link. Please ask to be re-invited.') };
  }
}
