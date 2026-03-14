# DTO Rules

Applies to: packages/dto/**/*.ts

## Schema and Type Naming

- All schema and type names must start with the **Entity name** as prefix
- Pattern: `{Entity}{Qualifier}Schema` and `{Entity}{Qualifier}Type`
- **Never include "Dto" in schema or type names** — only enums use the `DtoEnum` suffix
- Examples: `ProjectResponseSchema`, `ProjectDetailResponseType`, `UserClientCreateRequestSchema`, `OrganisationClientResponseSchema`

## BaseFieldsSchema Pattern

Each entity DTO file should define an **unexported** `{Entity}BaseFieldsSchema` containing the shared fields. This base schema is then used to build the Create, Update, Response, and DetailResponse schemas via `.extend()`.

```typescript
// Not exported - internal to the DTO file
const ProjectBaseFieldsSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  status: z.enum(ProjectStatusDtoEnum),
  isKeyProject: z.boolean().optional(),
  forecastedStartDate: z.string().datetime({ offset: true }).optional(),
  forecastedEndDate: z.string().datetime({ offset: true }).optional(),
  address: AddressSchema.optional(),
});

// Create extends BaseFields, adding creation-specific fields
export const CreateProjectRequestSchema = ProjectBaseFieldsSchema.extend({
  projectTypeId: z.number().optional(),
  projectPhaseId: z.number().optional(),
  additionalInformation: z.string().optional(),
  files: z.array(UpsertMediaSchema).optional(),
});
export type CreateProjectRequestType = z.infer<typeof CreateProjectRequestSchema>;

// Update extends Create with id
export const UpdateProjectRequestSchema = CreateProjectRequestSchema.extend({
  id: z.number(),
});
export type UpdateProjectRequestType = z.infer<typeof UpdateProjectRequestSchema>;

// Response extends BaseFields with id and timestamps
export const ProjectResponseSchema = ProjectBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
export type ProjectResponseType = z.infer<typeof ProjectResponseSchema>;

// DetailResponse MUST extend Response — never define fields independently
export const ProjectDetailResponseSchema = ProjectResponseSchema.extend({
  documents: z.array(MediaResponseSchema),
});
export type ProjectDetailResponseType = z.infer<typeof ProjectDetailResponseSchema>;
```

## DetailResponse Must Extend Response

- **`{Entity}DetailResponseSchema` must always `.extend()` from `{Entity}ResponseSchema`** — never define it as a standalone `z.object()`
- This guarantees `DetailResponseType` is a superset of `ResponseType`, which allows `dbTo{Entity}DetailResponse()` in use cases to spread `dbTo{Entity}Response()` and only add the extra detail fields

## Schema/Type Ordering

- Define a schema, then immediately define its type, then the next schema and its type
- Never group all schemas together followed by all types

```typescript
// Correct
const ProjectCreateSchema = z.object({ ... });
type ProjectCreateType = z.infer<typeof ProjectCreateSchema>;

const ProjectUpdateSchema = z.object({ ... });
type ProjectUpdateType = z.infer<typeof ProjectUpdateSchema>;
```

## Enum Location

- Enums should be declared in `src/enum.ts` with lowercase values
- DTO enums end with `DtoEnum` suffix (e.g., `UserRoleDtoEnum`)

## Zod Enum Validation

- Always use `z.enum(EnumName)` for enum validation
- Never use `z.nativeEnum()` - it is deprecated

## FilterRequestSchema Pattern

Each entity that supports search/listing must define a `{Entity}FilterRequestSchema` that extends `FilterRequestSchema`:

```typescript
export const ProjectFilterRequestSchema = FilterRequestSchema.extend({
  organisationIds: z.array(z.number()).optional(),
  typeIds: z.array(z.number()).optional(),
  phaseIds: z.array(z.number()).optional(),
  statuses: z.array(z.enum(ProjectStatusDtoEnum)).optional(),
  isKeyProject: z.array(z.string()).optional(),
  contactUserId: z.number().optional(),
});
export type ProjectFilterRequestType = z.infer<typeof ProjectFilterRequestSchema>;
```

### Rules:

- **Extends `FilterRequestSchema`** — which provides `pagination` and `sort`
- **All `z.array()` properties must use plural names** — e.g., `statuses`, `sources`, `organisationIds`, `priorities`. For boolean-like fields that don't pluralize naturally, use a descriptive plural form (e.g., `isKeyProject` → `keyProjectOptions`)
- **All array filter props are `.optional()`**
- **Enums use `z.array(z.enum(SomeDtoEnum)).optional()`** — when the field has both a DTO enum and DB enum, use the DTO enum with `z.enum()`. Only use `z.array(z.string()).optional()` for fields that don't have a defined DTO enum
- **IDs use `z.array(z.number()).optional()`**
- **Date ranges** use paired start/end string fields (e.g., `createdAtStartDate`, `createdAtEndDate`)
- **Single-value filters** (e.g., `contactUserId`, `taskId`) use `z.number().optional()` without array

```typescript
// More examples
export const TaskFilterRequestSchema = FilterRequestSchema.extend({
  priorities: z.array(z.enum(TaskPriorityDtoEnum)).optional(),
  statuses: z.array(z.enum(TaskStatusDtoEnum)).optional(),
  assignedUserIds: z.array(z.number()).optional(),
  assignedUserGroupIds: z.array(z.number()).optional(),
  createdAtStartDate: z.string().optional(),
  createdAtEndDate: z.string().optional(),
});
export type TaskFilterRequestType = z.infer<typeof TaskFilterRequestSchema>;

export const CreditNoteFilterRequestSchema = FilterRequestSchema.extend({
  organisationIds: z.array(z.number()).optional(),
  statuses: z.array(z.enum(CreditNoteStatusDtoEnum)).optional(),
  types: z.array(z.enum(CreditNoteTypeDtoEnum)).optional(),
  creationTypes: z.array(z.enum(CreditNoteCreationTypeDtoEnum)).optional(),
  creditNoteDateStartDate: z.string().optional(),
  creditNoteDateEndDate: z.string().optional(),
});
export type CreditNoteFilterRequestType = z.infer<typeof CreditNoteFilterRequestSchema>;
```

## Package Scope

- `@repo/dto` exports **only**: Zod schemas, types, and enum definitions
- No utilities, no error classes, no constants - those belong in `@repo/shared`

## DTO Implementation Patterns

- For detailed DTO implementation patterns, see `.claude/commands/dto.md`
