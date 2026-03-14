import { AsyncLocalStorage } from 'async_hooks';

export interface QueryContextData {
  requestId?: string;
  userId?: number;
  ucClass?: string;
  ucMethod?: string;
  ucParams?: Record<string, unknown>;
  daoClass?: string;
  daoMethod?: string;
  daoParams?: Record<string, unknown>;
}

const asyncLocalStorage = new AsyncLocalStorage<QueryContextData>();

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken', 'tx'];

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function isTransactionClient(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  return '$executeRaw' in value || '$queryRaw' in value || '$transaction' in value;
}

function sanitizeParams(args: unknown[]): Record<string, unknown> | undefined {
  if (args.length === 0) return undefined;

  // If single object argument, sanitize it directly
  if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    const obj = args[0] as Record<string, unknown>;
    // Filter out transaction clients
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!isTransactionClient(value)) {
        filtered[key] = value;
      }
    }
    return sanitizeObject(filtered);
  }

  // Multiple arguments - index them
  const params: Record<string, unknown> = {};
  args.forEach((arg, index) => {
    if (arg !== undefined && !isTransactionClient(arg)) {
      params[`arg${index}`] = typeof arg === 'object' && arg !== null ? sanitizeObject(arg as Record<string, unknown>) : arg;
    }
  });

  return Object.keys(params).length > 0 ? params : undefined;
}

export const QueryContext = {
  /**
   * Run a function within a query context
   */
  run<T>(context: QueryContextData, fn: () => T): T {
    const currentContext = asyncLocalStorage.getStore() ?? {};
    return asyncLocalStorage.run({ ...currentContext, ...context }, fn);
  },

  /**
   * Get the current query context
   */
  get(): QueryContextData | undefined {
    return asyncLocalStorage.getStore();
  },

  /**
   * Run with request ID context
   */
  withRequestId<T>(requestId: string | undefined, fn: () => T): T {
    if (!requestId) {
      return fn();
    }
    return this.run({ requestId }, fn);
  },

  /**
   * Run with UC context
   */
  withUc<T>(ucClass: string, ucMethod: string, params: unknown[], fn: () => T): T {
    return this.run({ ucClass, ucMethod, ucParams: sanitizeParams(params) }, fn);
  },

  /**
   * Run with DAO context
   */
  withDao<T>(daoClass: string, daoMethod: string, params: unknown[], fn: () => T): T {
    return this.run({ daoClass, daoMethod, daoParams: sanitizeParams(params) }, fn);
  },
};

export const queryContextStorage = new AsyncLocalStorage<QueryContextData>();

export function getQueryContext(): QueryContextData | undefined {
  return queryContextStorage.getStore();
}
