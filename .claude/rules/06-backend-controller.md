# Backend Controller Rules

Applies to: apps/api-backend/**/*.controller.ts, packages/nest-lib/**/*.ts

## Controller Naming Convention

Controllers must follow these naming patterns based on their route prefix:

| File Pattern | Route Prefix | Example |
|--------------|--------------|---------|
| `{entity}.controller.ts` | `/api/**` | `property.controller.ts` → `/api/property` |
| `{entity}.public.controller.ts` | `/public/**` | `property.public.controller.ts` → `/public/api/property` |

**Special cases** (keep as-is):
- `app-status.controller.ts` → `/app` (health check endpoint)
- `auth.controller.ts` → `/auth` (authentication endpoint)

**Rules:**
- Use `.public.` suffix (dot notation) for public controllers, not `-public` or `-client` suffixes
- Each entity should have at most one public controller (`{entity}.public.controller.ts`)
- Merge multiple public controllers for the same route into a single file

## Delegate to Use Cases

- Controllers delegate to use cases and return the response from the use case
- Controllers must **NEVER** create response objects directly - all response objects must be created and returned by use cases

```typescript
// Correct
return await this.useCase.action(dto);

// Wrong - controller creating response
await this.useCase.action(dto);
return { status: true, message: 'Success' };
```

## CRUD Return Types

All CRUD operations for an entity must use consistent DTO response types:

| Operation | Return Type |
|---|---|
| `create()` | `{Entity}ResponseType` |
| `update()` | `{Entity}ResponseType` |
| `getById()` | `{Entity}DetailResponseType` |
| `search()` | `PaginatedResponseType<{Entity}ResponseType>` |

- **`getById`** returns the **detail** response type (includes nested/related data like documents, items, etc.)
- **`create`**, **`update`**, and **`search`** return the **standard** response type (lighter, no deeply nested data)
- For entities without a separate detail response, all operations use `{Entity}ResponseType`

## Type Boundaries

- Controllers only work with **DTO types** (from `@repo/dto`)
- **Never import DAO types** (e.g., `ProjectWithPhaseType`) in controllers — those are internal to the use case layer

## REST Endpoint Rules

- DELETE method should not use body. Use path params
