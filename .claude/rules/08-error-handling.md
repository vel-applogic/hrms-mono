# Error Handling Rules

Applies to: apps/api-backend/**/*.ts, packages/nest-lib/**/*.ts

## Never Use NestJS Exceptions

**NEVER use NestJS exceptions directly** (`BadRequestException`, `NotFoundException`, etc.) - always use Api errors from `@repo/shared`.

## Available Error Classes (import from `@repo/shared`)

- **ApiBadRequestError** (400) - User input errors, validation failures
  - `reportToSentry: false` by default
  - Use for: invalid data, missing required fields, business rule violations

- **ApiNotFoundError** (404) - Resource not found errors
  - `reportToSentry: false` by default
  - Use for: entity lookups that fail

- **ApiUnauthenticatedError** (401) - Authentication failures
  - `reportToSentry: true` by default (potential security issues)
  - Use for: invalid credentials, expired tokens, missing auth

- **ApiNotAuthorizedError** (403) - Authorization failures
  - `reportToSentry: true` by default (potential security issues)
  - Use for: insufficient permissions, access denied

## Adding Contextual Data

All Api errors accept an optional `extra` parameter for debugging context:

```typescript
throw new ApiBadRequestError('Project not found', {
  projectId: params.dto.id,
  userId: params.currentUser.id,
  organizationId: params.currentUser.organizationId,
});
```

## Validation Errors

- **ApiZodValidationError** - For Zod schema validation errors (`reportToSentry: false`, used automatically by validation pipes)

### ApiFieldValidationError — Field-Level Validation

Use `ApiFieldValidationError` for domain-specific validation where the error must be tied to a specific field in the request body. It accepts an array of Zod-compatible issue objects so the API response maps the error to the exact field the frontend form can highlight.

**The `path` array mirrors the shape of the request body** — it tells the client exactly which field has the error.

```typescript
// Simple field — error on a top-level field
throw new ApiFieldValidationError([
  { path: ['email'], code: 'custom', message: 'Email already linked with an account' }
]);

// Simple field — uniqueness check
throw new ApiFieldValidationError([
  { path: ['title'], code: 'custom', message: 'Title already taken' }
]);

// Simple field — invalid enum value
throw new ApiFieldValidationError([
  { path: ['role'], code: 'custom', message: 'Role has to be one of admin or management' }
]);

// Nested field — error on an item within an array by ID
throw new ApiFieldValidationError([
  { path: ['bedrooms', 'id', updateBedroomId], code: 'custom', message: 'Bedroom does not belong to property' }
]);

// Dynamic path — using the request field name to point to the right array
throw new ApiFieldValidationError([
  { path: [`${params.type}s`, mediaId], code: 'custom', message: 'media does not belong to property' }
]);

// Related entity validation
throw new ApiFieldValidationError([
  { path: ['organisationId'], code: 'custom', message: 'Organisation must be of type client' }
]);

// Multiple errors at once
const customErrors: z.ZodIssue[] = [];
for (const item of items) {
  if (!isValid(item)) {
    customErrors.push({ path: ['items', item.id], code: 'custom', message: 'Item is invalid' });
  }
}
if (customErrors.length > 0) {
  throw new ApiFieldValidationError(customErrors);
}
```

### When to use which:

- **ApiFieldValidationError** — when the error relates to a specific field in the request body (the frontend can highlight the field). Use `path` to point to the exact field.
- **ApiBadRequestError** — when the error is a general business rule violation not tied to a specific form field.

## Exception Filter Behavior

- `reportToSentry: true` -> logged with `logger.e()` (reports to Sentry)
- `reportToSentry: false` -> logged with `logger.w()` (warning only, no Sentry)
- The `extra` parameter is automatically passed to the logger for context

## DbRecordNotFoundError Pattern

```typescript
try {
  return await this.projectDao.getByIdOrThrow({ id: params.dto.id });
} catch (err) {
  if (err instanceof DbRecordNotFoundError) {
    throw new ApiBadRequestError('Project not found', {
      projectId: params.dto.id,
    });
  }
  throw err;
}
```
