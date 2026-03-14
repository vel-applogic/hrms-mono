# Frontend UI Rules

Applies to: apps/web-app/**/\*.tsx, packages/ui/**/\*.tsx

## DateFormat Component

- **ALWAYS use `DateFormat` component from `@repo/ui/component/DateFormat` for rendering dates in UI**
- Never display raw date strings directly
- The component handles formatting and null/undefined values automatically

```tsx
// Correct
<DateFormat date={requirement.checkInDate} />;

// Wrong
{
  requirement.checkInDate;
}
```

## shadcn/ui Component Layer Structure

Three-tier structure: `shadcn/` (generated) → `ui/` (customisation layer) → apps always import from `ui/`

### `shadcn/` — Generated, never edit

- **NEVER directly edit components in `packages/ui/src/component/shadcn/`**
- These are standard shadcn registry output, managed by `pnpm dlx shadcn@latest add`
- Can be safely overwritten by the CLI at any time

### `ui/` — Customisation layer

- All project-specific customisations go here
- **Apps (`web-admin`, `web-app`) must ALWAYS import from `@repo/ui/component/ui/`, NEVER from `@repo/ui/component/shadcn/`**
- Within `packages/ui`, non-shadcn components (e.g., `autocomplete.tsx`, `datepicker.tsx`) must also import from `./ui/`, never `./shadcn/` directly
- Custom components that have no shadcn equivalent (e.g., `modal.tsx`, `icon-input.tsx`) live directly in `ui/`
- **NEVER place non-shadcn custom components in `shadcn/`**

### Wrapper Patterns

Choose the pattern based on the scope of customisation needed:

| Pattern                            | When to use                                            | Example                                                                           |
| ---------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **className wrapper**              | Override only styling (className), keep same component | `ui/input.tsx` — wraps ShadcnInput with custom h-12, border-2, bg-muted           |
| **CVA re-implementation**          | Add new variants or sizes beyond shadcn defaults       | `ui/badge.tsx`, `ui/button.tsx` — full CVA with custom variants                   |
| **Selective re-export + override** | Override one subcomponent, re-export the rest          | `ui/select.tsx` — overrides SelectTrigger, re-exports Select, SelectContent, etc. |
| **Full re-implementation**         | Completely different rendering logic                   | `ui/checkbox.tsx` — different icon handling for indeterminate state               |

```tsx
// className wrapper — ui/input.tsx
import { Input as ShadcnInput } from '../shadcn/input';
const Input = React.forwardRef(({ className, ...props }, ref) => (
  <ShadcnInput className={cn('h-12 rounded-lg border-2 bg-muted', className)} ref={ref} {...props} />
));

// Selective re-export + override — ui/select.tsx
export { Select, SelectContent, SelectGroup, SelectItem, ... } from '../shadcn/select';
const SelectTrigger = /* custom implementation with CaretSortIcon */;
export { SelectTrigger };

// CVA re-implementation — ui/badge.tsx (like ui/button.tsx)
const badgeVariants = cva(/* base */, { variants: { /* all custom variants */ } });
```

## Card/List View Toggle Pattern

Pages that support both a card view and a list (datatable) view must follow this pattern. Reference implementation: `/question` page (`question-list.tsx`).

### Page layout (`page.tsx`)

Match the `/user` page layout — simple `h-full` wrapper, no `ScrollArea`, no page-level footer:

```tsx
export default function EntityPage() {
  return (
    <div className='h-full px-4 py-4 md:px-11'>
      <EntityList />
    </div>
  );
}
```

### View toggle

- Use `useState<'cards' | 'list'>('cards')` for view state
- Render an icon-based pill toggle using `LayoutGrid` and `LayoutList` from `lucide-react`
- Active button: `bg-primary text-primary-foreground`
- Inactive button: `text-muted-foreground hover:text-white`
- No text label — icons only

```tsx
<div className='flex rounded-lg border border-border bg-card p-1'>
  <button
    onClick={() => setViewMode('cards')}
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
      viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-white',
    )}
  >
    <LayoutGrid className='h-4 w-4' />
  </button>
  <button
    onClick={() => setViewMode('list')}
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
      viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-white',
    )}
  >
    <LayoutList className='h-4 w-4' />
  </button>
</div>
```

### List view datatable

Use `DataTableSimple` from `@repo/ui/container/datatable/datatable` — the same component used on the `/user` page:

- **Must include** `pagination` prop (renders the pagination footer)
- **Must include** `useMediaQuery('(max-width: 1023px)')` for mobile detection
- **Must use** `autoHeight={isMobile}` — fixed height with scroll on desktop, auto-expanding on mobile
- **Must wrap** the datatable in `<div className="min-h-0 flex-1">` so it fills available space on desktop
- The outer component container must have `h-full` (e.g., `<div className="flex h-full flex-col gap-6">`)

```tsx
const isMobile = useMediaQuery('(max-width: 1023px)');

// Conditional render
{
  viewMode === 'cards' ? (
    <div>{/* card view */}</div>
  ) : (
    <div className='min-h-0 flex-1'>
      <DataTableSimple<EntityRow>
        tableKey='entity-list'
        rowData={tableRows}
        colDefs={colDefs}
        pagination={{ page: 1, pageSize: 10, total: tableRows.length }}
        onActionClick={handleActionClick}
        autoHeight={isMobile}
      />
    </div>
  );
}
```

### Row type and column definitions

Define outside the component:

- `type EntityRow` — flat row type for the datatable
- `const actionOptions: ActionOption[]` — action buttons (using icons from `lucide-react`)
- `const colDefs: ColDef<EntityRow>[]` — column definitions
- `const tableRows: EntityRow[]` — mapped from source data to flat row shape
- Use `BadgeRenderer` for status columns, `ActionsIconCellRenderer` for the actions column

## Page Data Fetching

- **Wrap ALL API calls in a single `handleApiCall`** — never leave API calls outside the error boundary
- **Use `Promise.all` when a page makes multiple independent API calls** — if one call doesn't depend on the result of another, run them in parallel
- **Move synchronous setup (e.g., `buildTaskFilterRequest`) before `handleApiCall`** so both calls can start immediately

```tsx
// Correct — parallel calls inside one handleApiCall
const filterRequest = buildTaskFilterRequest({ searchParams, ... });

const result = await handleApiCall(async () => {
  const [entity, listData] = await Promise.all([entityService.getById(id), listService.search(filterRequest)]);
  return { entity, listData };
});

if (!result.success) return result.errorView;

// Wrong — sequential calls, listService.search not error-handled
const result = await handleApiCall(() => entityService.getById(id));
if (!result.success) return result.errorView;
const entity = result.data;

const listData = await listService.search(filterRequest); // not wrapped, sequential
```

## Form Patterns

- React Hook Form with Zod validation
- For UI form implementation patterns, see `.claude/commands/ui.md`

### Form Schema Convention

Form Zod schemas are **defined inside the component file** and are **never exported**. They exist solely for UI-level validation and may differ from the API request schema.

**Rules:**

1. **Define form schema in the same file** as the modal/form component — not in a separate file
2. **Never export** the form schema or its inferred type — they are local to the component
3. **Submit handler converts** form data to the API request type before calling the action
4. **Actions use API request schemas** from `@repo/dto` (e.g., `TaskCreateRequestSchema`), not form schemas
5. **Actions that need extra params** (e.g., path params like `propertyId`) define an inline `z.object()` as input schema

**Why form schemas differ from API schemas:**

- Form may use `Date` objects; API expects ISO strings
- Form field names may differ from API names (e.g., `phone` → `contactPhone`)
- Form may have UI-only fields (e.g., autocomplete objects with `id` + `name`)
- Form may include operational fields (e.g., `removeExistingRelatedOrganisationIds`)

```tsx
// Inside the modal/form component file

// 1. Define form schema locally — NOT exported
const FormSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  dueDate: z.date().optional(),
  priority: z.enum(TaskPriorityDtoEnum),
  assigned: z.object({ id: z.number(), name: z.string() }).optional(),
});

type FormType = z.infer<typeof FormSchema>;

// 2. Use in form
const form = useForm<FormType>({
  resolver: zodResolver(FormSchema),
  defaultValues: { action: '', priority: TaskPriorityDtoEnum.medium },
});

// 3. Submit converts form data → API request type
const handleSubmit = (data: FormType) => {
  const submitData: TaskCreateRequestType = {
    action: data.action,
    dueDate: data.dueDate?.toISOString(),
    priority: data.priority,
    assignedUserId: data.assigned?.id,
  };
  createAction.execute(submitData);
};
```

```typescript
// In action.ts — uses API schema from @repo/dto, NOT the form schema
export const createTaskAction = safeAction
  .metadata({ actionName: 'createTask' })
  .inputSchema(TaskCreateRequestSchema) // from @repo/dto
  .action(async ({ parsedInput: data }) => {
    return await taskService.create(data);
  });

// Action with extra params (e.g., propertyId from route)
export const addContactsAction = safeAction
  .metadata({ actionName: 'addContacts' })
  .inputSchema(z.object({ propertyId: z.number(), operatorIds: z.array(z.number()) }))
  .action(async ({ parsedInput }) => {
    return await propertyService.addContacts(parsedInput.propertyId, parsedInput.operatorIds);
  });
```
