import { APIError } from '@repo/ui/lib/axios/axios-error';

export type ActionFieldError = { field: string; message: string };
export type ActionError = { message: string; fieldErrors?: ActionFieldError[] };
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };

export function extractActionError(err: unknown, fallback = 'An unexpected error occurred'): ActionError {
  if (err instanceof APIError) {
    const fieldErrors = err.validationErrors
      ?.map((e) => ({ field: String(e.path[0] ?? ''), message: e.message }))
      .filter((e) => e.field.length > 0);

    return {
      message: err.message || fallback,
      fieldErrors: fieldErrors?.length ? fieldErrors : undefined,
    };
  }
  if (err instanceof Error) return { message: err.message || fallback };
  return { message: fallback };
}
