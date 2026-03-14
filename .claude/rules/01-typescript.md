# TypeScript Code Rules

Applies to: **/*.ts, **/*.tsx

## No `any` Type

- **NEVER use `any` type** in TypeScript code
- Always use proper types from the codebase or define appropriate interfaces

## No `as` Type Assertions

- **NEVER use `as` type assertions to bypass TypeScript errors**
- When you encounter a type error:
  1. Investigate the root cause of the type mismatch
  2. Update function signatures or interfaces to accept the correct types
  3. Only use `as` for `Prisma.InputJsonValue` conversions or other library-specific requirements
  4. If you find yourself wanting to use `as`, stop and fix the underlying type issue instead
- Maintain strict TypeScript typing throughout the codebase

## Array/String Emptiness Checks

- **Use `x?.length` for null-safe length checks** when the variable is NOT used inside the block afterwards (return values, filter callbacks, standalone conditionals)
- **Keep `x && x.length > 0`** when the variable is used inside the block — TypeScript needs the `x &&` truthiness check to narrow the type from `T | undefined` to `T`

```typescript
// Correct — variable not used afterwards
return (rec?.length ?? 0) > 0;
.filter((id) => id?.length)
if (sortState?.length) { doSomethingElse(); }

// Correct — variable used inside the block, needs narrowing
if (items && items.length > 0) {
  for (const item of items) { ... }  // TypeScript knows items is defined
}
{items && items.length > 0 && (
  <ul>{items.map(...)}</ul>  // TypeScript knows items is defined
)}

// Wrong — redundant explicit null check when && already handles it
if (items != null && items.length > 0) { ... }
if (items !== undefined && items.length > 0) { ... }
```

