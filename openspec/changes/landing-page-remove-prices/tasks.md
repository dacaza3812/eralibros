# Tasks: Remove Book Prices from Landing Page

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~5 (5 deletions in one file) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Hide Featured Books prices on landing page only | PR 1 (single) | `pnpm run lint`; `pnpm run build` | `pnpm run dev`; browser assert no `$` on `/`, price still visible on `/catalogo` and `/libros/[slug]` | `git checkout app/page.tsx` (single-file revert) |

## Phase 1: Core Implementation

- [x] 1.1 Delete the price block (lines 250–254) in the Featured Books map of `app/page.tsx`: remove the `{book.price && (<p ...>${book.price.toLocaleString('es-AR')}</p>)}` conditional render
- [x] 1.2 Keep `price` in the `Book` interface and both Supabase `.select()` calls in `app/page.tsx` (shared fetch used by Classic section); confirm no remaining `price` reference in the Featured Books JSX

## Phase 2: Verification

- [ ] 2.1 Run `pnpm run lint` — expect no new ESLint errors (interface still declares `price`, so no unused-var)
- [ ] 2.2 Run `pnpm run build` — TypeScript compiles and the page renders successfully
- [ ] 2.3 Scenario "Prices hidden on landing page": load `/` in browser, assert each Featured Books card shows title/author and NO `$` price text
- [ ] 2.4 Scenario "Prices remain visible elsewhere": load `/catalogo` and `/libros/[slug]` (read-only) — price display unchanged
- [ ] 2.5 Scenario "Featured books with null price": load `/`, assert null-price books render title/description with no placeholder or empty price element