# Naming Conventions

Applies to: **/\*.ts, **/\*.tsx

## Singular Naming

- **Use singular naming** for all files, classes, and directories
- Examples: `invoice` not `invoices`, `requirement` not `requirements`
- Directories: `invoice/`, `requirement/`, `uc/`
- Frontend: `atom`, `schema`, `component` not `atoms`, `schemas`, `components`

## Controllers

- File: `{entity}.controller.ts`
- Class: `{Entity}Controller` (e.g., `InvoiceController`)
- Methods:
  - Single entity: `{action}()` (e.g., `search()`, `getById()`, `create()`)
  - Multiple types: `{type}{Action}()` (e.g., `generatedSearch()`, `upcomingGetById()`, `generatedGetFilterOption()`)

## Modules

- File: `{entity}.module.ts`
- Class: `{Entity}Module` (e.g., `InvoiceModule`)

## Use Cases

- File: `{entity}-{type}-{action}.uc.ts` (e.g., `invoice-generated-search.uc.ts`)
- Class: `{Entity}{Type}{Action}UseCase` (e.g., `InvoiceGeneratedSearchUseCase`)
- Base: `_base-{entity}.uc.ts` with class `Base{Entity}UseCase`

## DAOs

- Class: `{Entity}Dao` (e.g., `InvoiceDao`, `RequirementDao`)

## DTOs

- File: `invoice.dto.ts`
- Types: `InvoiceResponseType`
- Follow singular entity naming

## Frontend (web-app)

### App Router (`src/app/`)

The app router only contains routing concerns — no business logic:

- `page.tsx` — route page (server component)
- `layout.tsx` — shared layout
- `tab.tsx` — tab navigation
- `header.tsx` — header component (may be empty)
- `header.server.tsx` — async server header (fetches data)
- `error.tsx` — error boundary
- `not-found.tsx` — 404 page

### Feature Folders (`src/feature/`)

#### Folder Organization

- **`component/`** — pure components (no server actions or external services)
- **`container/`** — container components (call server actions or external services)
- **`atom/`** — Jotai state atoms
- **`form/`** — form components

#### Server Actions

- Each feature folder has **one consolidated `action.ts`** file at its root
- Complex features with sub-sections may have additional `action.ts` files in sub-folders
- All actions use `'use server'` directive and `safeAction` wrapper

#### Server vs Client Components

- `page.tsx` in app router is server-side by default — no suffix needed
- Any server-side file in `feature/` must use **`.server.tsx`** suffix
- Client components do NOT get a special suffix — just use `{entity}-{operation}.tsx`

#### File Naming

All business logic lives in `feature/{entity}/`. Singular entity naming (e.g., `invoice/`, `requirement/`, `property/`).

**File naming pattern:** Every file is prefixed with the full path from the feature folder through any sub-folders, joined by `-`.

- `feature/invoice/` -> files start with `invoice-`
- `feature/requirement/booking/` -> files start with `requirement-booking-`
- `feature/requirement/booking/early-checkout/` -> files start with `requirement-booking-early-checkout-`

```
feature/invoice/
  action.ts                           # ONE consolidated action.ts per feature
  dto.ts                              # Feature-specific types
  atom/
    invoice-atom.ts
  component/
    invoice-status-badge.tsx
  container/
    invoice.datatable.tsx             # .datatable.tsx suffix
    invoice-detail.drawer.tsx         # .drawer.tsx suffix
    invoice-date-edit.modal.tsx       # .modal.tsx suffix
    invoice-filter-control.tsx
    invoice-download-pdf.tsx
  form/
    invoice-form.tsx
```

### File Suffixes

Only four suffixes are used:

| Suffix           | When to use                                         |
| ---------------- | --------------------------------------------------- |
| `.server.tsx`    | Server component in a feature folder (not page.tsx) |
| `.datatable.tsx` | Data table components                               |
| `.drawer.tsx`    | Drawer/side panel components                        |
| `.modal.tsx`     | Modal dialog components                             |

- Only `page.tsx` (in app router) is implicitly server-side
- Any other server-side file in `feature/` must use `.server.tsx` suffix
- **Do NOT use** `.client.tsx`, `.component.tsx`, `.container.tsx` or any other suffix
- All other files use plain `{entity}-{operation}.tsx`

### Complex Features with Sub-sections

```
feature/requirement/
  action.ts                                         # Root actions
  booking/
    action.ts                                       # Sub-feature actions
    requirement-booking-tab.tsx
    early-checkout/
      action.ts                                     # Deeper sub-feature actions
      requirement-booking-early-checkout.modal.tsx
      requirement-booking-early-checkout-data.tsx
  shortlisted/
    atom/requirement-shortlisted-atom.ts
    container/requirement-shortlisted.tsx
    container/requirement-shortlisted-list.tsx
    container/requirement-shortlisted-map.tsx
  client-list/
    action.ts
    requirement-client-list-page.tsx
```
