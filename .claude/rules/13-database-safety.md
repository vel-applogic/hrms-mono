# Database Safety Rules

Applies to: packages/db/**/*.ts, apps/api-backend/**/*.ts

## Migration Safety

- **NEVER run `prisma migrate` commands or `pnpm db:migrations-create`**
- The developer will handle database migrations manually after schema changes
- Only make changes to the Prisma schema file when requested

## Naming Convention

- Uses snake_case database naming convention

## No N+1 Queries

- NEVER create N+1 query patterns - always fetch related data in a single query
- If a single query solution is not possible, explicitly inform the user
