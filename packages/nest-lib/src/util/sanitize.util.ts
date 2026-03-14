const SENSITIVE_KEYS = ['password', 'otp', 'token', 'secret', 'apikey', 'api_key'];

export function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) => lowerKey.includes(sensitiveKey));

      if (isSensitive) {
        sanitized[key] = '***';
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }

    return sanitized;
  }

  return obj;
}
