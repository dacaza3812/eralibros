# Proposal: Remove Book Prices from Landing Page

## Intent

The user wants book prices hidden on the landing page to focus visitor attention on book titles and descriptions rather than pricing during initial browsing. This is a targeted UX improvement for the homepage only.

## Scope

### In Scope
- Remove price display from Featured Books section on `app/page.tsx`
- Keep prices visible on catalog page (`app/catalogo/page.tsx`) and book detail pages (`app/libros/[slug]/page.tsx`)

### Out of Scope
- Removing prices from catalog or detail pages (future work)
- Modifying price data structure or database schema
- Adding alternative pricing displays (e.g., "Enquire for price")

## Capabilities

### New Capabilities
None

### Modified Capabilities
None — no spec-level behavior changes; this is a UI rendering adjustment within existing functionality.

## Approach

Remove the conditional price rendering in the Featured Books section of `app/page.tsx`. The current pattern `{book.price && ...}` wraps the price display — delete this conditional block entirely. If `price` becomes unused after removal, optionally remove it from the data fetch to reduce payload size.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/page.tsx` | Modified | Remove price rendering from Featured Books section |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Prices accidentally removed from other pages | Low | Only modify `app/page.tsx`; verify catalog/detail pages unchanged |

## Rollback Plan

Revert the `app/page.tsx` change via `git checkout app/page.tsx` or re-add the conditional price block.

## Dependencies

None

## Success Criteria

- [ ] Book prices no longer display on the landing page
- [ ] Prices remain visible on catalog and book detail pages
- [ ] No TypeScript or lint errors introduced
