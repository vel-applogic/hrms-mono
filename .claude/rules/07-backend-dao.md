# Backend DAO Rules

Applies to: packages/nest-lib/src/db/dao/**/*.ts

## Purpose

DAOs are **pure data access** — no business logic. They contain only reusable CRUD and query methods. Business logic belongs in use cases.

## BaseDao and getPrismaClient

All DAOs extend `BaseDao`. The base class holds `prisma: PrismaService` but entity DAOs must **never use `this.prisma` directly**. Always use `this.getPrismaClient(tx)` which returns the transaction client when inside a transaction, or the default prisma client otherwise.

```typescript
@Injectable()
@TrackQuery()
export class ProjectDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<ProjectWithPhaseType | undefined> {
    const pc = this.getPrismaClient(params.tx);  // ALWAYS use this, never this.prisma
    return await pc.project.findFirst({ ... });
  }
}
```

## Transaction Parameter Rules

| Method | `tx` | Required? |
|---|---|---|
| `create()` | `tx: Prisma.TransactionClient` | **Required** |
| `update()` | `tx: Prisma.TransactionClient` | **Required** |
| `delete()` / `deleteByIdOrThrow()` | `tx: Prisma.TransactionClient` | **Required** |
| `getById()` / `getByIdOrThrow()` | `tx?: Prisma.TransactionClient` | Optional |
| `search()` | `tx?: Prisma.TransactionClient` | Optional |

## Data Parameter Types

Use the appropriate Prisma type for data params — define type aliases at the bottom of the DAO file:

```typescript
// At the bottom of the DAO file
type ProjectInsertTableRecordType = Prisma.ProjectCreateInput;
type ProjectUpdateTableRecordType = Prisma.ProjectUpdateInput;
```

Then use in methods:

```typescript
public async create(params: { data: ProjectInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
  const pc = this.getPrismaClient(params.tx);
  const created = await pc.project.create({ data: params.data });
  if (!created?.id) {
    throw new DbOperationError('Project not created');
  }
  return created.id;
}

public async update(params: { id: number; data: ProjectUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
  const pc = this.getPrismaClient(params.tx);
  await pc.project.update({ where: { id: params.id }, data: params.data });
}

public async deleteByIdOrThrow(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
  const pc = this.getPrismaClient(params.tx);
  const dbRecord = await pc.project.findUnique({ where: { id: params.id } });
  if (!dbRecord) {
    throw new DbRecordNotFoundError('Invalid project id');
  }
  await pc.project.update({ where: { id: params.id }, data: { isDeleted: true } });
}
```

## Return Types

Custom return types are defined at the **bottom of the DAO file** and always extend a Prisma type.

**Exported DAO types must only be imported by use cases and base use cases.** Never import DAO types in controllers, DTOs, or anywhere else. Controllers work with DTO types only — the use case's `dbTo*Response()` method handles the conversion from DAO types to DTO types.

### No `undefined` in DAO Return Types

Prisma never returns `undefined` for fields — it returns `null`. DAO types must reflect this:

- **Use `propertyName: Type | null`** — never `propertyName?: Type | null` or `propertyName?: Type`
- The `?:` (optional) syntax implies `undefined`, which does not match Prisma's behaviour
- This applies to all custom properties added via `&` intersection types, not just Prisma-generated fields

```typescript
// Correct — explicit null, no optional marker
export type ProjectWithPhaseType = ProjectSelectTableRecordType & {
  projectPhase: Pick<ProjectPhaseSelectTableRecordType, 'id' | 'title'> | null;
  sourcedByUser: UserSelectMinTableRecordType | null;
  thumbnailKey: string | null;
};

// Wrong — optional marker implies undefined
export type ProjectWithPhaseType = ProjectSelectTableRecordType & {
  projectPhase?: Pick<ProjectPhaseSelectTableRecordType, 'id' | 'title'> | null;
  sourcedByUser?: UserSelectMinTableRecordType | null;
  thumbnailKey?: string | null;
};
```

```typescript
// Bottom of the DAO file

// Base table record type
type ProjectSelectTableRecordType = Prisma.ProjectGetPayload<{}>;
type ProjectInsertTableRecordType = Prisma.ProjectCreateInput;
type ProjectUpdateTableRecordType = Prisma.ProjectUpdateInput;

// Return types extending Prisma types
export type ProjectWithPhaseType = ProjectSelectTableRecordType & {
  projectPhase: Pick<ProjectPhaseSelectTableRecordType, 'id' | 'title'> | null;
  projectType: Pick<ProjectTypeSelectTableRecordType, 'id' | 'title' | 'isSimple'> | null;
  mainContractorOrganisation: Pick<OrganisationSelectTableRecordType, 'id' | 'name'> | null;
};

export type ProjectDetailWithPhaseType = ProjectWithPhaseType & {
  documents: Array<{ mediaId: number; media: { key: string; name: string } }>;
};

export type ProjectSearchMinimalRecordType = Prisma.ProjectGetPayload<{
  select: { id: true; title: true; isDeleted: true };
}>;
```

## Method Return Type Summary

| Method | Returns |
|---|---|
| `create()` | `number` (the created ID) |
| `update()` | `void` |
| `delete()` | `void` (soft delete via `isDeleted: true` for entities that have `isDeleted`) |
| `getById()` | `{CustomType} \| undefined` |
| `getByIdOrThrow()` | `{CustomType}` (throws `DbRecordNotFoundError`) |
| `search()` | `{ totalRecords: number; dbRecords: {CustomType}[] }` |

## Error Handling

- `create()` — throw `DbOperationError` if creation fails (`!created?.id`)
- `getByIdOrThrow()` — throw `DbRecordNotFoundError` if not found
- `deleteByIdOrThrow()` — throw `DbRecordNotFoundError` if not found
- Callers (use cases) catch `DbRecordNotFoundError` and rethrow as `ApiBadRequestError`

## Explicit Properties

Don't use spread operators when calling DAO methods from use cases — explicitly list all properties.
