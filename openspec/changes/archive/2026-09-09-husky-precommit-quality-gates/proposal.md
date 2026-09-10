# Proposal: Husky Pre-Commit Quality Gates

## Intent

Prevent broken code from entering the repository by running automated quality checks (linting, type checking, tests) before each commit. This enforces quality at commit-time rather than discovering issues in CI or production.

## Scope

### In Scope
- Install and configure Husky for Git hooks
- Fix broken npm scripts (`lint`, add `typecheck`)
- Create pre-commit hook running: ESLint + TypeScript + Vitest
- Document exact manual installation commands for user execution
- Provide lint-staged configuration option for faster commits

### Out of Scope
- CI/CD pipeline configuration (separate change)
- E2E/Playwright tests in hooks (missing config, deferred)
- Pre-push hooks for heavy operations (future work)
- Formatting tools (Prettier not configured)

## Capabilities

### New Capabilities
- `quality-gates`: Automated lint, type-check, and test validation at commit time

### Modified Capabilities
- None (new capability, no existing specs affected)

## Approach

**Option B (Recommended): lint-staged + full typecheck + vitest run**

Install Husky for Git hooks and lint-staged for performance. Fix the broken `lint` script (currently `eslint` without args → runs on nothing). Add missing `typecheck` script. Configure pre-commit hook to run ESLint on staged files via lint-staged, full `tsc --noEmit`, and `vitest run`.

**Trade-offs:**
- **Without lint-staged**: Simpler setup, but runs ESLint on entire codebase (~3-5s overhead)
- **With lint-staged**: Faster commits (only changed files), but requires configuration

**Selected:** Option B with lint-staged for team velocity.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Fix `lint` script, add `typecheck`, add `lint-staged` config, add `prepare` script |
| `.husky/pre-commit` | New | Git hook running quality gates |
| `.husky/` | New | Directory for Husky hooks |
| `package.json` → devDependencies | New | husky, lint-staged |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Developer bypasses hooks with `--no-verify` | Med | Document consequences; CI still catches issues |
| Hook execution slows commits (>10s) | Low | lint-staged reduces scope; use `vitest run` (not watch) |
| Tests flake in hook context | Low | Use `vitest run` (one-shot), not watch mode |
| New developers unfamiliar with Husky | Low | Document in README; one-time setup via `pnpm install` |

## Rollback Plan

1. Remove `.husky/` directory
2. Remove `husky` and `lint-staged` from devDependencies: `pnpm remove husky lint-staged`
3. Remove `"prepare": "husky"` script from package.json
4. `lint` script fix and `typecheck` addition are harmless improvements — keep them

## Dependencies

- **External:** husky ^9.x, lint-staged ^15.x
- **Runtime:** Node.js 18+, pnpm 10.6.1
- **Existing tools:** ESLint 9, TypeScript 5, Vitest 5 (all installed)

## Success Criteria

- [ ] `pnpm run lint` lints entire project (`eslint .`)
- [ ] `pnpm run typecheck` runs without errors (`tsc --noEmit`)
- [ ] `pnpm run test:run` executes in one-shot mode
- [ ] Pre-commit hook blocks commits when any check fails
- [ ] Hook execution time < 10s for typical changes
- [ ] `pnpm install` automatically sets up hooks via `prepare` script

## Manual User Commands

> **DO NOT RUN THESE AUTOMATICALLY.** User must execute manually.

### Step 1: Install Husky and lint-staged
```bash
pnpm add -D husky lint-staged
```

### Step 2: Initialize Husky
```bash
pnpm exec husky init
```

### Step 3: Update package.json scripts

Add/modify these scripts in `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs}": [
      "eslint --fix"
    ]
  }
}
```

### Step 4: Create .husky/pre-commit

Replace `.husky/pre-commit` content with:

```bash
pnpm exec lint-staged
pnpm run typecheck
pnpm run test:run
```

### Step 5: Install hooks (if Step 2 didn't run prepare)
```bash
pnpm run prepare
```

---

**Total:** 5 manual steps, ~2 minutes execution time.
