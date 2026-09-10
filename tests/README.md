# Testing Infrastructure

This directory contains all tests for the eralibros project.

## Structure

```
tests/
├── unit/              # Unit tests for utilities, validators, pure functions
├── components/        # Component tests (React Testing Library)
├── api/               # API integration tests
├── e2e/               # End-to-end tests (Playwright)
├── mocks/             # MSW handlers and server setup
│   ├── handlers/      # API mock handlers
│   └── server.ts      # MSW server configuration
├── fixtures/          # Test data fixtures
├── factories/         # Test entity factories
└── utils/             # Test utilities and helpers
```

## Commands

- `pnpm test` - Run tests in watch mode
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Run tests with coverage report

## Coverage Thresholds

- Overall: 50%
- Critical paths (books, orders): 70%
- API routes: 60%
- Components: 50%

## Testing Stack

- **Vitest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: E2E testing
