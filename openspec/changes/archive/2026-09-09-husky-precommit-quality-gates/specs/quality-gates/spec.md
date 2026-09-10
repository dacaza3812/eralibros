# Quality Gates Specification

## Purpose

Automated quality validation at commit-time to prevent broken code from entering the repository. This capability enforces linting, type checking, and test execution before each commit completes.

## Requirements

### Requirement: Pre-Commit Hook Executes Quality Gates

The system SHALL execute lint, typecheck, and tests before allowing a commit to complete. All three checks MUST pass for the commit to succeed.

The pre-commit hook MUST run:
1. ESLint on staged files via lint-staged
2. TypeScript type checking (`tsc --noEmit`) on the full codebase
3. Vitest tests in one-shot mode (`vitest run`)

#### Scenario: All quality checks pass - commit succeeds

- GIVEN staged changes with no lint errors
- AND no TypeScript type errors
- AND all tests passing
- WHEN user commits changes
- THEN lint-staged runs ESLint on staged files successfully
- AND `tsc --noEmit` completes without errors
- AND `vitest run` executes all tests and passes
- AND the commit is created successfully

#### Scenario: Lint errors detected - commit blocked

- GIVEN staged changes containing ESLint violations
- WHEN user attempts to commit
- THEN lint-staged runs ESLint on staged files
- AND ESLint reports violations to stdout
- AND the commit is blocked with non-zero exit code
- AND user sees lint error details in terminal

#### Scenario: TypeScript type errors detected - commit blocked

- GIVEN staged changes with no lint errors
- AND TypeScript type errors present in the codebase
- WHEN user attempts to commit
- THEN lint-staged runs ESLint on staged files successfully
- AND `tsc --noEmit` reports type errors
- AND the commit is blocked with non-zero exit code
- AND user sees type error details with file paths and line numbers

#### Scenario: Test failures detected - commit blocked

- GIVEN staged changes with no lint errors
- AND no TypeScript type errors
- AND one or more failing tests
- WHEN user attempts to commit
- THEN lint-staged runs ESLint successfully
- AND `tsc --noEmit` completes successfully
- AND `vitest run` executes and reports test failures
- AND the commit is blocked with non-zero exit code
- AND user sees failing test names and assertion details

#### Scenario: User bypasses hooks with --no-verify

- GIVEN quality check failures present
- WHEN user commits with `git commit --no-verify`
- THEN the pre-commit hook does not execute
- AND the commit is created without running quality gates
- AND user acknowledges risk per documented consequences

### Requirement: Lint Script Targets Entire Project

The `lint` script SHALL execute ESLint on the entire codebase.

The `package.json` lint script MUST be configured as `eslint .` to validate all applicable files.

#### Scenario: Lint script runs on full codebase

- GIVEN the project has TypeScript/JavaScript files
- WHEN user runs `pnpm run lint`
- THEN ESLint validates all files matching eslint.config.mjs patterns
- AND reports errors with file paths and rule identifiers
- AND exits with non-zero code if violations found

### Requirement: TypeCheck Script Valid Without Emission

The system SHALL provide a `typecheck` script for TypeScript validation without file emission.

The `package.json` MUST include a `typecheck` script configured as `tsc --noEmit`.

#### Scenario: TypeCheck validates types without emitting files

- GIVEN TypeScript source files exist in the project
- WHEN user runs `pnpm run typecheck`
- THEN TypeScript compiler validates all files per tsconfig.json
- AND reports type errors with file paths and line numbers
- AND does not emit JavaScript files
- AND exits with non-zero code if type errors found

### Requirement: Test Run Script Executes One-Shot Tests

The system SHALL provide a `test:run` script for non-watch test execution suitable for hooks.

The `package.json` MUST include a `test:run` script configured as `vitest run`.

#### Scenario: Test run executes without watch mode

- GIVEN test files exist matching vitest.config.ts patterns
- WHEN user runs `pnpm run test:run`
- THEN Vitest executes all tests once
- AND exits after completion (does not watch)
- AND reports test results to stdout
- AND exits with non-zero code if any test fails

### Requirement: Hooks Auto-Install On Package Install

The system SHALL automatically install Git hooks when developers run package installation.

The `package.json` MUST include a `prepare` script configured as `husky`.

#### Scenario: Fresh install sets up hooks automatically

- GIVEN a fresh clone of the repository
- WHEN developer runs `pnpm install`
- THEN the `prepare` script executes
- AND Husky initializes the `.husky/` directory
- AND `.husky/pre-commit` hook is registered with Git
- AND subsequent commits run the quality gates automatically

### Requirement: Hook Execution Performance

The pre-commit hook execution time SHALL NOT exceed 10 seconds for typical staged changes.

The hook MUST use lint-staged to run ESLint only on staged files (not entire codebase).

#### Scenario: Hook runs within performance budget

- GIVEN 5-10 staged files with typical changes
- WHEN pre-commit hook executes
- THEN total execution time is less than 10 seconds
- AND user experiences minimal commit latency

#### Scenario: Large staged change approaches performance threshold

- GIVEN 20+ staged files with extensive changes
- WHEN pre-commit hook executes
- THEN total execution time may exceed 10 seconds
- AND user is warned in documentation about large commits
- AND hook still completes (no artificial timeout)
