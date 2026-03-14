# Package Import Rules

Applies to: **/\*.ts, **/\*.tsx

## `@repo/dto`

- DTOs (Zod schemas, types, enum definitions) and enum to/from string utilities
- Enums should be declared in `src/enum.ts` with lowercase values

## `@repo/shared`

- Code shared between all apps (UI, API, and backend)
- Utilities, constants, error classes

## `@repo/nest-lib`

- Shared code for backend only (NestJS utilities, DAOs, enum conversion functions)

## `@repo/ui`

- Shared code for UI only (React components shared web-app only for now)
