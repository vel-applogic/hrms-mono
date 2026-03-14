# Audit System Rules

Applies to: apps/api-backend/**/*.ts

## Core Principles

- Use `AuditService.recordActivity()` to track changes
- The audit system uses a main `AuditActivity` table and a junction table `AuditActivityHasEntity` for related entities

## currentUser Rules

- **The `currentUser` (actor) should NEVER be included in `relatedEntities` array** - the actor is already tracked in the audit record itself
- For account-related operations where the user is acting on their own account, use empty `relatedEntities: []`

## Related Entities

- Pass `relatedEntities` array with entities being acted upon (e.g., task, property, requirement, organisation, project)
- **Include related entities from the entity being acted upon, not from currentUser** - e.g., for property operations, use the property's organisationId, not currentUser.organisationId
- Include parent entities (organisation, project) for context and filtering when applicable
- Use the `message` field in related entities to provide context (e.g., "property was added", "property was removed")

## Private `recordActivity()` Method Pattern

Every use case that records audit activity must implement it as a **private method** on the use case class, called non-blocking from `action()` after the transaction completes.

### Structure

1. **`validate()` returns data needed for audit** — Define a `ValidateResultType` that captures entity data needed for the audit description and related entities. This avoids re-fetching after the transaction.
2. **`action()` calls `void this.recordActivity(...)`** — Always non-blocking (`void` prefix), always after the transaction succeeds.
3. **`recordActivity()` is a private method** — Receives a typed params object and calls `this.auditService.recordActivity()`.

### Basic Pattern (create/delete — no computeChanges)

```typescript
type ValidateResultType = {
  item: CreditNoteItemWithCreditNoteType;
};

public async action(params: Params): Promise<OperationStatusResponseType> {
  const validateResult = await this.validate(params);

  await this.transaction(async (tx) => {
    // ... mutation logic
  });

  void this.recordActivity({ validateResult, currentUser: params.currentUser });

  return { status: true, message: 'Item deleted successfully' };
}

private async recordActivity(params: { validateResult: ValidateResultType; currentUser: CurrentUserType }): Promise<void> {
  await this.auditService.recordActivity({
    eventGroup: AuditEventGroupDtoEnum.operation,
    eventType: AuditEventTypeDtoEnum.update,
    status: AuditActivityStatusDtoEnum.success,
    currentUser: params.currentUser,
    description: `Deleted item from credit note CN-Draft-${params.validateResult.item.creditNote.id}`,
    relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.creditNote, entityId: params.validateResult.item.creditNote.id }],
  });
}
```

### Update Pattern (with computeChanges)

For update use cases, `validate()` returns the entity **before** the update. After the transaction, pass both old and new data to `recordActivity()`:

```typescript
public async action(params: Params): Promise<ProjectResponseType> {
  const existingProject = await this.validate(params);

  await this.transaction(async (tx) => { /* ... */ });

  const updatedProject = await this.getProjectById(params.dto.id);
  void this.recordActivity(params, existingProject, updatedProject);

  return updatedProject;
}

private async recordActivity(params: Params, oldProject: ProjectWithPhaseType, newProject: ProjectResponseType): Promise<void> {
  const changes = this.computeChanges({
    oldValues: { title: oldProject.title, /* ... */ },
    newValues: { title: newProject.title, /* ... */ },
  });

  await this.auditService.recordActivity({
    data: { changes },
    // ...
  });
}
```

### Create Pattern (computeChanges with empty oldValues)

For create use cases, pass `oldValues: {}` to show all new fields:

```typescript
void this.recordActivity({ operatorId, dto: params.dto, currentUser: params.currentUser });

private async recordActivity(params: { operatorId: number; dto: UserOperatorCreateRequestType; currentUser: CurrentUserType }): Promise<void> {
  const changes = this.computeChanges({
    oldValues: {},
    newValues: { email: params.dto.email, firstname: params.dto.firstname, /* ... */ },
  });
  // ...
}
```

### Success/Failure Pattern (e.g., login)

For operations that can fail after partial execution, use two separate private methods:

```typescript
public async action(params: Params): Promise<AuthLoginResponseType> {
  try {
    // ... authentication logic
    void this.recordActivitySuccess({ user, email: params.dto.email });
    return result;
  } catch (error) {
    void this.recordActivityFailure({ user, email: params.dto.email, error });
    throw error;
  }
}

private async recordActivitySuccess(params: { user: UserResponseType; email: string }): Promise<void> { /* ... */ }
private async recordActivityFailure(params: { user: UserResponseType | null; email: string; error: unknown }): Promise<void> { /* ... */ }
```

### Batch Pattern (loop over validated results)

When an action processes multiple items, create a separate audit record for each:

```typescript
private async recordActivity(params: { validateResult: ValidateResultType; currentUser: CurrentUserType }): Promise<void> {
  for (const bookingDeposit of params.validateResult.bookingDeposits) {
    await this.auditService.recordActivity({
      description: `Marked deposit as paid for booking ${bookingDeposit.bookingNumber}`,
      relatedEntities: [/* per-item entities */],
      // ...
    });
  }
}
```

### Rules

- **Always use `void` prefix** when calling from `action()` — audit must never block the response
- **Never inline audit calls in `action()`** — always extract to a private method
- **Return from `validate()` what audit needs** — entity IDs, names for descriptions, related entity IDs
- **Params object must be typed** — use inline `{ validateResult: ValidateResultType; currentUser: CurrentUserType }` or similar
- For operations with success/failure paths (e.g., login), use separate `recordActivitySuccess()` and `recordActivityFailure()` methods

## computeChanges() — Tracking Field-Level Diffs

Use `computeChanges()` from the base class to compare old and new values. It returns a diff of only the fields that changed.

**Enums must be stored as readable labels, not raw enum values.** Use `*DtoEnumToReadableLabel()` functions when building both `oldValues` and `newValues` so the audit log is human-readable.

```typescript
private async recordActivity(params: Params, oldProject: ProjectWithPhaseType, newProject: ProjectResponseType): Promise<void> {
  const oldStatus = oldProject.status ? ProjectStatusDtoEnum[oldProject.status] : null;

  const changes = this.computeChanges({
    oldValues: {
      title: oldProject.title,
      status: oldStatus ? projectStatusDtoEnumToReadableLabel(oldStatus) : null,
      isKeyProject: oldProject.isKeyProject,
      type: oldProject.projectType?.title,
      phase: oldProject.projectPhase?.title,
    },
    newValues: {
      title: newProject.title,
      status: newProject.status ? projectStatusDtoEnumToReadableLabel(newProject.status) : null,
      isKeyProject: newProject.isKeyProject,
      type: newProject.type?.title,
      phase: newProject.phase?.title,
    },
  });

  await this.auditService.recordActivity({
    data: changes,
    // ...
  });
}
```

### Rules for computeChanges:

- **Enums → always convert to readable label** using `*DtoEnumToReadableLabel()` before passing to `oldValues`/`newValues`
- **Nested objects** (e.g., organisation, type, phase) → use the display field (`.title`, `.name`) not the raw object
- **Dates** → convert to ISO string for consistent comparison
- **Nullable fields** → use `?? null` to normalise undefined to null

## Reference

For detailed audit implementation patterns, see `.claude/commands/api.md`
