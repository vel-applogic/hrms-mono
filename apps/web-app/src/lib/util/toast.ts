'use client';

import { toast } from 'sonner';

import { extractActionError } from '@/lib/util/action-result';

// How long a toast stays visible before auto-dismissing. Change this single
// constant to adjust the duration for every toast in the app.
export const TOAST_DURATION_MS = 5000;

export function showSuccessToast(message: string): void {
  toast.success(message, { duration: TOAST_DURATION_MS });
}

export function showErrorToast(err: unknown, fallback = 'Something went wrong'): void {
  const { message } = extractActionError(err, fallback);
  toast.error(message, { duration: TOAST_DURATION_MS });
}

// Wraps an async action (typically a server action) so success and error
// outcomes are surfaced as toasts. Returns the result on success, or undefined
// on failure (the error toast has already been shown).
export async function runWithToast<T>(
  fn: () => Promise<T>,
  opts: { success?: string; error?: string } = {},
): Promise<{ ok: true; data: T } | { ok: false; error: unknown }> {
  try {
    const data = await fn();
    if (opts.success) showSuccessToast(opts.success);
    return { ok: true, data };
  } catch (err) {
    showErrorToast(err, opts.error);
    return { ok: false, error: err };
  }
}
