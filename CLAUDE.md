# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Code quality rules** are in `.claude/rules/` (auto-loaded by path).
> **Implementation patterns** are in `.claude/commands/` (api.md, ui.md, dto.md, etc.).

## Project Overview

Hrms is a monorepo for managing settlement/relocation services. Built with Turborepo, pnpm workspaces, NestJS backend APIs, Next.js admin frontend, and PostgreSQL with PostGIS.

## Rules to follow

- The dev server is already running in a separate terminal. Dont start new dev servers.
- To verify code, use typecheck as defined in code checks
- **NEVER run `prisma migrate` commands or `pnpm db:migrations-create`** - The developer will handle database migrations manually after schema changes. Only make changes to the Prisma schema file when requested
- **NEVER run `git commit` or `git push`** - The developer will handle all git operations manually

## Development Commands

### Core Development

- `pnpm dev` - Start all applications (api-backend: 6002, web-app: 6001)
- `pnpm dev:api-backend` - Start only API admin backend
- `pnpm dev:web-app` - Start only web-app frontend
- `pnpm build` - Build all applications
- `pnpm lint` - Run ESLint across all packages

### Database Operations

- `pnpm db:client-generate` - Generate Prisma client
- `pnpm db:migrations-create` - Generate new migration
- `pnpm db:migrations-apply` - Apply pending migrations

### Code checks

```bash
# Run linting (shows warnings only due to eslint-plugin-only-warn)
pnpm lint
# Run TypeScript type checking
pnpm typecheck
# Run TypeScript type checking for single project
pnpm typecheck --filter=api-backend
# Build all packages
pnpm build
```

### Package Management

```bash
# Add dependency to workspace root
pnpm add -D -w <package-name>
# Add dependency to specific app/package
pnpm add <package-name> --filter=api-backend
# Update all @nestjs packages
pnpm up "@nestjs/*@latest" --recursive
# Update specific package across workspace
pnpm up "next@latest" --recursive
```

## Architecture

### Monorepo Structure

- `apps/api-backend` - NestJS internal admin API (port 4001)
- `apps/web-app` - Next.js admin interface (port 4000)
- `packages/db` - Prisma ORM with PostgreSQL
- `packages/dto` - DTOs (Zod schemas, types, enum definitions)
- `packages/shared` - Code shared between all apps (errors, utilities)
- `packages/nest-lib` - Shared code for NestJS backends only
- `packages/ui` - Shared UI components (between web frontends)

### Backend Architecture (NestJS)

- Module-based architecture with use case pattern (`uc/` directories)
- DAO pattern for database access
- Custom middleware for authentication and request context

### Frontend Architecture (Next.js)

- App router with route groups for authentication states
- Feature-based folder organization
- React Hook Form with Zod validation
- Server actions for API communication

### Database Schema

- PostgreSQL with PostGIS for geospatial functionality
- Key entities: users (with role-based access)

### Shared Package Updates

When modifying shared packages:

1. Make changes in the package
2. Run `pnpm build` in the package directory
3. Dependent applications automatically use updated package

## Environment Setup

### Prerequisites

- Node.js >= 22
- pnpm
- PostgreSQL with PostGIS extensions
- Docker (for local development)

### Adding Dependencies

```bash
# Add to specific workspace
pnpm add <package> --filter <workspace-name>

# Examples
pnpm add lodash --filter api-backend
pnpm add -D @types/node --filter @repo/db
```

## Development Notes

- Use `pnpm dev:api-backend` to verify backend functionality
- Frontend apps use different ports to avoid conflicts
- Docker Compose provides PostgreSQL on port 5436 and Mailcrab on port 1080/1025
