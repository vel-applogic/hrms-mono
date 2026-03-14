# Zod Rules

Applies to: **/*.ts, **/*.tsx

## No `.merge()`

- **Never use `.merge()`** — use `.extend()` instead

```typescript
// Correct
const CreateSchema = BaseFieldsSchema.extend({ organisationId: z.number() });

// Wrong
const CreateSchema = BaseFieldsSchema.merge(z.object({ organisationId: z.number() }));
```

## No `z.string().email()`

- **Never use `z.string().email()`** — it is deprecated. Use `z.email()` instead

```typescript
// Correct
const schema = z.object({ email: z.email() });

// Wrong
const schema = z.object({ email: z.string().email() });
```

## No `z.nativeEnum()`

- **Never use `z.nativeEnum()`** — it is deprecated. Always use `z.enum(EnumName)`
- For filter arrays, use `z.array(z.string())` with enum conversion in the DAO layer

```typescript
// Correct
const schema = z.object({ status: z.enum(TaskStatusDtoEnum) });

// Wrong
const schema = z.object({ status: z.nativeEnum(TaskStatusDtoEnum) });
```

## Schema/Type Ordering

- Define a schema, then immediately define its type, then the next schema and its type
- Never group all schemas together followed by all types

```typescript
// Correct
const CreateSchema = z.object({ ... });
type CreateType = z.infer<typeof CreateSchema>;

const UpdateSchema = z.object({ ... });
type UpdateType = z.infer<typeof UpdateSchema>;

// Wrong - never group schemas then types
const CreateSchema = z.object({ ... });
const UpdateSchema = z.object({ ... });
type CreateType = z.infer<typeof CreateSchema>;
type UpdateType = z.infer<typeof UpdateSchema>;
```
