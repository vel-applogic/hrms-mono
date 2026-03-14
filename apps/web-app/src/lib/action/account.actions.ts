'use server';

import type {
  AccountChangePasswordRequestType,
  AccountUpdateProfileRequestType,
  AccountUpdateProfileResponseType,
  OperationStatusResponseType,
} from '@repo/dto';
import { APIError } from '@repo/ui/lib/axios/axios-error';

import { accountService } from '@/lib/service/account.service';

export type ActionError = { message: string };
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };

function extractServiceError(err: unknown, fallbackMessage: string): ActionError {
  if (err instanceof APIError) {
    return { message: err.message || fallbackMessage };
  }
  if (err instanceof Error) {
    return { message: err.message || fallbackMessage };
  }
  return { message: fallbackMessage };
}

export async function updateProfile(
  dto: AccountUpdateProfileRequestType,
): Promise<ActionResult<AccountUpdateProfileResponseType>> {
  try {
    const data = await accountService.updateProfile(dto);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: extractServiceError(err, 'Failed to update profile. Please try again.') };
  }
}

export async function changePassword(
  dto: AccountChangePasswordRequestType,
): Promise<ActionResult<OperationStatusResponseType>> {
  try {
    const data = await accountService.changePassword(dto);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: extractServiceError(err, 'Failed to change password. Please try again.') };
  }
}
