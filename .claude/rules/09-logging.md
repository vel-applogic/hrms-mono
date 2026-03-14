# Logging Rules

Applies to: apps/api-backend/**/*.ts, packages/nest-lib/**/*.ts

## CommonLoggerService Methods

Always use the correct logger method with proper parameter order.

### `logger.i()` - Info

- Signature: `i(msg: string, obj?: Record<string, unknown>): void`
- Use for: General information, process flows, successful operations

### `logger.w()` - Warning

- Signature: `w(msg: string, obj?: Record<string, unknown>): void`
- Use for: Non-critical issues, expected exceptions handled gracefully

### `logger.a()` - Alert/Error WITHOUT an error object

- Signature: `a(msg: string, obj?: Record<string, unknown>): void`
- Reports to Sentry as 'error' level
- Use for: Error conditions without a caught exception (HTTP error responses, validation failures, missing data)

### `logger.e()` - Error WITH an error object

- Signature: `e(msg: string, error: unknown, obj?: Record<string, unknown>): void`
- Reports to Sentry as 'fatal' level
- **CRITICAL: The error must be the 2nd parameter, NOT inside the context object**

## Correct Usage

```typescript
// Correct - most common pattern: just message + error (no extra context needed)
try {
  await someOperation();
} catch (error) {
  this.logger.e('Operation failed', error);
}

// Correct - with optional extra context as 3rd argument
try {
  await sendEmail();
} catch (err) {
  this.logger.e('Failed to send assignment email', err, {
    taskId: task.id,
    userId: assignee.id,
  });
}

// Correct - logger.a() for non-exception errors
if (!response.ok) {
  const errorText = await response.text();
  this.logger.a('API request failed', { status: response.status, error: errorText });
  throw new Error('Request failed');
}
```

## Common Mistakes

```typescript
// WRONG - error in context object instead of as 2nd parameter
this.logger.e('Operation failed', { error: error, userId: params.userId });

// WRONG - creating Error just to use logger.e()
this.logger.e('API request failed', new Error(errorText), { status: response.status });
// Use logger.a() instead when there's no caught exception
```

## When to Use Which

- **logger.e()** - caught exception/error object from try-catch
- **logger.a()** - error-level logging without an Error object (HTTP failures, validation errors)
- **logger.w()** - expected issues handled gracefully
- **logger.i()** - normal operational logging
