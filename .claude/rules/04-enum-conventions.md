# Enum Conventions

Applies to: **/*.ts, **/*.tsx

## Naming Suffixes

- **DTO enums** (in `@repo/dto`): End with `DtoEnum` suffix (e.g., `UserRoleDtoEnum`, `TaskStatusDtoEnum`)
- **DB/Prisma enums** (in `@repo/db`): End with `DbEnum` suffix (e.g., `UserRoleDbEnum`, `TaskStatusDbEnum`)

## CRITICAL: No Type Casting for Enum Conversions

**NEVER use `as`, `as unknown as`, `as any`, or any TypeScript type assertion to convert between enum types, strings, or labels.** Every enum conversion must go through a dedicated conversion function from `enum.util.ts`. If the function doesn't exist, create it - do not bypass with type casting.

```typescript
// WRONG - never do this
const dtoEnum = dbValue as UserRoleDtoEnum;
const dtoEnum = dbValue as unknown as UserRoleDtoEnum;
const label = someEnum as string;
const dbEnum = dtoValue as any as UserRoleDbEnum;

// CORRECT - always use conversion functions
const dtoEnum = userRoleDbEnumToDtoEnum(dbValue);
const label = userRoleDtoEnumToReadableLabel(dtoEnum);
const dbEnum = userRoleDtoEnumToDbEnum(dtoValue);
const dtoEnum = stringToUserRoleDtoEnum(stringValue);
```

## Enum Conversion Utilities

All enum conversions must use dedicated functions. Function names must be self-explanatory about which enum type they work with.

### `@repo/nest-lib` `util/enum.util.ts` — any conversion involving a DbEnum

Used in the backend only. This is where any function that touches a DB enum lives:

| Conversion | Example |
|---|---|
| **DB enum -> DTO enum** | `userRoleDbEnumToDtoEnum(dbVal)` |
| **DTO enum -> DB enum** | `userSourceDtoEnumToDbEnum(dtoVal)` |

### `@repo/shared` `enum.util.ts` — DTO-only conversions (for UI, API, and shared code)

No DB enum dependency. Safe to use from frontend and backend:

| Conversion | Example |
|---|---|
| **String -> DTO enum** | `stringToUserSourceDtoEnum(str)` |
| **DTO enum -> readable label** | `userSourceDtoEnumToReadableLabel(dtoVal)` |

- **NEVER create inline enum-to-label mappings** (e.g., `const labelMap: Record<SomeEnum, string> = { ... }`). Always use existing `*DtoEnumToReadableLabel` functions from `@repo/shared`
- If a conversion function doesn't exist for an enum, **create it** in the appropriate `enum.util.ts` file - never fall back to type assertions

## No Local Type Aliases for Enums

- **NEVER create local type aliases for DTO enums** (e.g., `type PeriodType = RevenuePeriodTypeDtoEnum`)
- Always use the DTO enum type directly — it is the canonical type throughout the codebase
- This applies to component props, state types, function parameters, and return types

```typescript
// WRONG - don't alias enum types
type PeriodType = RevenuePeriodTypeDtoEnum;
const [period, setPeriod] = useState<PeriodType>(RevenuePeriodTypeDtoEnum.monthly);

// CORRECT - use the enum type directly
const [period, setPeriod] = useState<RevenuePeriodTypeDtoEnum>(RevenuePeriodTypeDtoEnum.monthly);
```

## Rules

- Never create new enum utility files in `api-backend` - always use the shared packages
- If a `*DtoEnumToReadableLabel` or `stringTo*DtoEnum` function doesn't exist, add it to `packages/shared/src/util/enum.util.ts`
- If a `*DbEnumToDtoEnum` or `*DtoEnumToDbEnum` function doesn't exist, add it to `packages/nest-lib/src/util/enum.util.ts`
