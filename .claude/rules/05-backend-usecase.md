# Backend Use Case Rules

Applies to: apps/api-backend/**/*.ts, packages/nest-lib/**/*.ts

## Constructor Injection

- DAOs must always be **required** (not optional or nullable) in constructor parameters
- Use cases should never have constructor variables as optional - all dependencies must be required

## No Spread Operators in DAO Calls

- Do not use spread operators when passing data to DAO methods
- Explicitly list all properties

```typescript
// Correct
await this.dao.create({ name: dto.name, type: dto.type });

// Wrong
await this.dao.create({ ...dto });
```

## Validate Before Transaction

- Use cases must never throw `DbRecordNotFoundError` from validate methods
- Always use try-catch and rethrow as `ApiBadRequestError` or appropriate Api error type
- Starting transactions in use cases must happen in the `action` method

## No N+1 Queries

- NEVER create N+1 query patterns - always fetch related data in a single query
- If a single query solution is not possible, explicitly inform the user that the request cannot be implemented without N+1 queries

## IUseCase Interface (REQUIRED)

Every concrete use case must implement `IUseCase<TParams, TResult>` from `@repo/nest-lib`. This enforces a consistent `action()` entry point with properly typed parameters and return values.

- **Concrete use cases** — must have `implements IUseCase<Params, ReturnType>` in the class declaration
- **Base use cases** (`_base-*.uc.ts`) — do NOT implement `IUseCase` (they provide shared logic only)
- **Inherited implementation** — if a parent base class already implements `IUseCase`, child classes inherit it and do not need to redeclare it

```typescript
// Correct — concrete use case implements IUseCase
@Injectable()
@TrackQuery()
export class TaskCreateUseCase extends BaseTaskUseCase implements IUseCase<Params, TaskResponseType> {
  public async action(params: Params): Promise<TaskResponseType> {
    // implementation
  }
}

// Correct — base use case does NOT implement IUseCase
@Injectable()
export class BaseTaskUseCase extends BaseUc {
  // shared logic only, no IUseCase
}

// Correct — child inherits IUseCase from parent (no need to redeclare)
@Injectable()
export class AuthUserOperatorLoginUseCase extends BaseAuthLoginUseCase {
  // BaseAuthLoginUseCase already implements IUseCase<Params, AuthLoginResponseType>
}

// Wrong — missing implements IUseCase
@Injectable()
@TrackQuery()
export class TaskCreateUseCase extends BaseTaskUseCase {
  public async action(params: Params): Promise<TaskResponseType> { ... }
}
```

## Use Case Structure

- Use cases in `uc/` directories extend base classes
- File: `{entity}-{type}-{action}.uc.ts`
- Class: `{Entity}{Type}{Action}UseCase`
- Base: `_base-{entity}.uc.ts` with class `Base{Entity}UseCase`

## Base Use Case Pattern (REQUIRED per module)

Every module must have a `_base-{entity}.uc.ts` that extends `BaseUc`. This base class holds the **DB-to-DTO conversion** and **getById** logic so it is written once and reused by create, update, getById, and search use cases.

### What belongs in the base use case:

1. **`dbTo{Entity}Response()`** — converts a DB record (with joins) to `{Entity}ResponseType`. Used by create, update, and search use cases.
2. **`dbTo{Entity}DetailResponse()`** — converts a DB record (with joins) to `{Entity}DetailResponseType`. **Must spread `dbTo{Entity}Response()`** and only add the extra detail fields — never duplicate field mappings. Used by getById use case. For entities without a separate detail response, this method is not needed.
3. **`get{Entity}ById()`** — fetches the DB record via DAO's `getByIdOrThrow`, converts via `dbTo{Entity}DetailResponse()`, and handles `DbRecordNotFoundError`. Returns `{Entity}DetailResponseType`.
4. **`get{Entity}ResponseById()`** — fetches the DB record via DAO's `getByIdOrThrow`, converts via `dbTo{Entity}Response()`, and handles `DbRecordNotFoundError`. Returns `{Entity}ResponseType`. Used by create and update use cases to return the saved entity.
5. **Shared business logic** — any logic reused across create/update/delete/search (e.g., creating related entities, computing values).

### CRUD Return Type Convention

All use cases for an entity must follow this return type pattern:

| Use Case | Return Type | Conversion Method |
|---|---|---|
| **create** | `{Entity}ResponseType` | `get{Entity}ResponseById()` |
| **update** | `{Entity}ResponseType` | `get{Entity}ResponseById()` |
| **getById** | `{Entity}DetailResponseType` | `get{Entity}ById()` |
| **search** | `PaginatedResponseType<{Entity}ResponseType>` | `dbTo{Entity}Response()` in `.map()` |

- **DB-to-DTO conversion must be defined once in the base use case** — child use cases must never create their own conversion logic
- For entities without a separate detail response, all operations use `{Entity}ResponseType` and the base only needs `dbTo{Entity}Response()` and `get{Entity}ById()`

### Example structure:

```typescript
@Injectable()
export class BaseInvoiceUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    auditService: AuditService,
    auditOperationDao: AuditOperationDao,
    protected readonly invoiceDao: InvoiceDao,
  ) {
    super(prisma, logger, auditService, auditOperationDao);
  }

  // DB -> DTO conversion for standard response (used by create, update, search)
  protected dbToInvoiceResponse(dbRec: InvoiceWithoutItemsType): InvoiceResponseType {
    return {
      id: dbRec.id,
      displayNumber: dbRec.xeroInvoiceNumber ?? `Draft-${dbRec.id}`,
      status: invoiceStatusDbEnumToDtoEnum(dbRec.status),
      // ... explicit field mapping, enum conversions
    };
  }

  // DB -> DTO conversion for detail response (used by getById)
  protected dbToInvoiceDetailResponse(dbRec: InvoiceWithItemsType): InvoiceDetailResponseType {
    return {
      ...this.dbToInvoiceResponse(dbRec),
      items: dbRec.items.map((item) => ({
        id: item.id,
        description: item.description,
        // ... item field mapping
      })),
    };
  }

  // GetById returning detail response (used by getById use case)
  protected async getInvoiceById(id: number): Promise<InvoiceDetailResponseType> {
    try {
      const dbRec = await this.invoiceDao.getByIdOrThrow({ id });
      return this.dbToInvoiceDetailResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Invoice not found');
      }
      throw error;
    }
  }

  // GetById returning standard response (used by create/update use cases)
  protected async getInvoiceResponseById(id: number): Promise<InvoiceResponseType> {
    try {
      const dbRec = await this.invoiceDao.getByIdOrThrow({ id });
      return this.dbToInvoiceResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Invoice not found');
      }
      throw error;
    }
  }
}
```

### How child use cases use it:

```typescript
// Create — returns standard response via base getResponseById
public async action(params: Params): Promise<InvoiceResponseType> {
  await this.validate(params);
  const createdId = await this.transaction(async (tx) => {
    return await this.invoiceDao.create({ ... , tx });
  });
  return await this.getInvoiceResponseById(createdId);
}

// Update — returns standard response via base getResponseById
public async action(params: Params): Promise<InvoiceResponseType> {
  await this.validate(params);
  await this.transaction(async (tx) => {
    await this.invoiceDao.update({ id: params.dto.id, ... , tx });
  });
  return await this.getInvoiceResponseById(params.dto.id);
}

// Search — maps DB records via base dbToResponse
public async action(params: Params): Promise<PaginatedResponseType<InvoiceResponseType>> {
  const { totalRecords, dbRecords } = await this.invoiceDao.search({ ... });
  const results = dbRecords.map((dbRec) => this.dbToInvoiceResponse(dbRec));
  return { page, limit, totalRecords, results };
}

// GetById — returns detail response via base getById
public async action(params: Params): Promise<InvoiceDetailResponseType> {
  return await this.getInvoiceById(params.id);
}
```

This pattern eliminates duplicate DB-to-DTO conversion code across use cases within the same module.
