# Tasks: Husky Pre-Commit Quality Gates

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 60-80 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Fix npm scripts in package.json | PR 1 | `pnpm run lint && pnpm run typecheck` | `pnpm run test:run` | Revert package.json script changes |
| 2 | Configure lint-staged | PR 1 | `pnpm exec lint-staged --dry-run` | N/A (dry-run validation) | Delete .lintstagedrc.json |
| 3 | Update pre-commit hook | PR 1 | Manual: `git commit` with clean state | Stage a file, run commit | Revert .husky/pre-commit to `pnpm test` |
| 4 | Enable Vitest cache | PR 1 | `pnpm run test:run` (check .vitest cache dir) | Compare run times: 1st vs 2nd | Remove cache config from vitest.config.ts |
| 5 | Verify end-to-end flow | PR 1 | Manual: `git commit` with lint/type/test failures | Stage bad code, verify block | N/A (verification, no code change) |

## Phase 1: Fix npm Scripts

- [ ] 1.1 Fix `lint` script in `package.json` from `"eslint"` to `"eslint ."`
- [ ] 1.2 Add `typecheck` script to `package.json`: `"typecheck": "tsc --noEmit"`
- [ ] 1.3 Verify scripts work: `pnpm run lint` and `pnpm run typecheck` execute without errors

## Phase 2: Configure lint-staged

- [ ] 2.1 Create `.lintstagedrc.json` at project root with ESLint --fix config
- [ ] 2.2 Configure pattern `*.{js,jsx,ts,tsx,mjs,cjs}` to run `eslint --fix`
- [ ] 2.3 Verify config: `pnpm exec lint-staged --dry-run` (no execution, validation only)

## Phase 3: Update Pre-Commit Hook

- [ ] 3.1 Replace `.husky/pre-commit` content with sequential gates: `pnpm lint-staged` → `pnpm typecheck` → `pnpm test:run`
- [ ] 3.2 Ensure hook uses `pnpm` commands (not npm) for packageManager compatibility
- [ ] 3.3 Verify hook is executable on Windows (Husky handles this automatically)

## Phase 4: Enable Vitest Cache

- [ ] 4.1 Add `cache: true` to `vitest.config.ts` test config if not already enabled
- [ ] 4.2 Verify cache directory `.vitest/` is created after first test run
- [ ] 4.3 Confirm second test run is faster (cache hit)

## Phase 5: Integration Verification

- [ ] 5.1 Manual test: Stage clean file → commit succeeds
- [ ] 5.2 Manual test: Stage file with lint error → commit blocked, lint error shown
- [ ] 5.3 Manual test: Stage file with type error → commit blocked, type error shown
- [ ] 5.4 Manual test: Stage file with failing test → commit blocked, test failure shown
- [ ] 5.5 Performance test: Verify hook completes < 10s for typical 5-10 file change

## Phase 6: Documentation

- [ ] 6.1 Update README (if exists) with hook behavior and `--no-verify` bypass note
- [ ] 6.2 Add note: CI still runs as safety net (hooks can be bypassed)
