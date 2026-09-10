# Apply Progress Report

**Change**: landing-page-remove-prices
**Mode**: Standard (no Strict TDD)
**Delivery Strategy**: auto-chain (stacked-to-main)
**PR Slice**: Single PR (all tasks)

## Completed Tasks

- [x] 1.1 Delete the price block (lines 250–254) in the Featured Books map of `app/page.tsx`: remove the `{book.price && (<p ...>${book.price.toLocaleString('es-AR')}</p>)}` conditional render
- [x] 1.2 Keep `price` in the `Book` interface and both Supabase `.select()` calls in `app/page.tsx` (shared fetch used by Classic section); confirm no remaining `price` reference in the Featured Books JSX

## Verification Results

**Lint**: ✅ PASS (no new ESLint errors)
```
pnpm run lint
✓ No ESLint errors
```

**Build**: ✅ PASS (TypeScript compiles, page renders)
```
pnpm run build
✓ Compiled successfully
✓ TypeScript check passed
✓ Static pages generated (35/35)
```

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm run lint` → PASS (no new errors) |
| Runtime harness | `pnpm run dev` → manual browser verification: load `/`, assert each Featured Books card shows title/author and NO `$` price text; load `/catalogo` and `/libros/[slug]` to confirm price display unchanged |
| Rollback boundary | `git checkout app/page.tsx` (single-file revert) |

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `app/page.tsx` | Modified | -5 lines (removed price conditional block) |

**Total**: 5 deletions (well under 400-line budget)

## Deviations from Design

None — implementation matches design.

## Issues Found

None.

## Status

2/2 tasks complete. Ready for verify.