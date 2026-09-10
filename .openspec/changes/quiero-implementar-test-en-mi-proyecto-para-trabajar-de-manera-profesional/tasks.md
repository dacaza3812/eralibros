# Tasks Breakdown: Testing Infrastructure Implementation

**Change**: quiero implementar test en mi proyecto para trabajar de manera profesional  
**Project**: eralibros  
**Created**: 2026-09-08

---

## 1. Task Breakdown

### Phase 1: Foundation (12-16 hours)

#### 1.1 Install Testing Dependencies
- [ ] Task: Install core testing framework and utilities
  - File: package.json (modify)
  - Purpose: Add Vitest, React Testing Library, MSW, and test tooling
  - Dependencies: None
  - LOC: ~15 (modified)
  - Packages to add:
    - vitest@^2.0.0
    - @vitest/ui@^2.0.0
    - @vitest/coverage-v8@^2.0.0
    - @vitejs/plugin-react@^4.3.0
    - @testing-library/react@^16.0.0
    - @testing-library/jest-dom@^6.4.0
    - @testing-library/user-event@^14.5.0
    - jsdom@^24.1.0
    - msw@^2.4.0
    - @faker-js/faker@^9.0.0
  - Estimate: 30 min

#### 1.2 Configure Vitest
- [ ] Task: Create vitest.config.ts
  - File: vitest.config.ts (new)
  - Purpose: Configure Vitest for Next.js + React 19 with jsdom, coverage thresholds
  - Dependencies: 1.1 complete
  - LOC: ~135
  - Key configuration:
    - jsdom environment with localhost:3000
    - Coverage thresholds: 70% critical paths, 60% API, 50% overall
    - Path alias @ -> ./
    - Include: tests/**/*.{test,spec}.{ts,tsx}
    - Exclude: tests/e2e/**, node_modules, .next
    - v8 coverage provider
  - Estimate: 45 min

#### 1.3 Create Vitest Setup File
- [ ] Task: Create vitest.setup.ts
  - File: vitest.setup.ts (new)
  - Purpose: Setup testing environment with MSW server, mocks for Next.js router/headers
  - Dependencies: 1.1 complete
  - LOC: ~75
  - Key setup:
    - Import @testing-library/jest-dom/vitest matchers
    - Configure MSW server lifecycle (beforeAll, afterEach, afterAll)
    - Mock next/navigation hooks (useRouter, useSearchParams, usePathname, useParams)
    - Mock next/headers (cookies, headers)
    - Cleanup after each test
    - Console.error suppression for warnings
  - Estimate: 30 min

#### 1.4 Setup MSW Handlers - Base Structure
- [ ] Task: Create MSW server setup
  - File: tests/mocks/server.ts (new)
  - Purpose: Configure MSW Node server for API mocking
  - Dependencies: 1.1 complete
  - LOC: ~15
  - Content: setupServer(...handlers) with helper functions useHandler, restoreHandlers
  - Estimate: 15 min

- [x] Task: Create combined handlers index
  - File: tests/mocks/handlers/index.ts (new)
  - Purpose: Export all MSW handlers in single location
  - Dependencies: 1.5, 1.6, 1.7, 1.8, 1.9 complete
  - LOC: ~10
  - Content: Import and spread auth, books, orders, categories, settings handlers
  - Estimate: 5 min

- [x] Task: Create auth handler
  - File: tests/mocks/handlers/auth.ts (new)
  - Purpose: Mock Supabase auth endpoints (login, logout, session)
  - Dependencies: 1.1 complete
  - LOC: ~90
  - Endpoints:
    - POST /auth/v1/token (signInWithPassword)
    - GET /auth/v1/session
    - POST /auth/v1/logout
  - Helpers: setAuthenticated(), clearAuthentication()
  - Estimate: 45 min

- [x] Task: Create books handler
  - File: tests/mocks/handlers/books.ts (new)
  - Purpose: Mock Supabase REST API for books CRUD
  - Dependencies: 1.1 complete, 1.10 (data)
  - LOC: ~120
  - Endpoints:
    - GET /rest/v1/books (list + filter by slug)
    - POST /rest/v1/books (create)
    - PATCH /rest/v1/books (update)
    - DELETE /rest/v1/books (delete)
  - In-memory store with resetBooksStore() helper
  - Estimate: 60 min

- [x] Task: Create orders handler
  - File: tests/mocks/handlers/orders.ts (new)
  - Purpose: Mock Supabase REST API for orders CRUD
  - Dependencies: 1.1 complete, 1.11 (data)
  - LOC: ~100
  - Similar structure to books handler
  - Estimate: 45 min

- [x] Task: Create categories handler
  - File: tests/mocks/handlers/categories.ts (new)
  - Purpose: Mock Supabase REST API for categories
  - Dependencies: 1.1 complete, 1.12 (data)
  - LOC: ~80
  - Estimate: 30 min

- [x] Task: Create settings handler
  - File: tests/mocks/handlers/settings.ts (new)
  - Purpose: Mock Supabase REST API for settings
  - Dependencies: 1.1 complete
  - LOC: ~60
  - Estimate: 20 min

#### 1.5 Create Test Data Fixtures
- [x] Task: Create books fixture data
  - File: tests/mocks/data/books.ts (new)
  - Purpose: Provide realistic book objects for tests
  - Dependencies: 1.1 complete
  - LOC: ~50
  - 5-10 realistic book objects matching DB schema
  - Estimate: 20 min

- [x] Task: Create orders fixture data
  - File: tests/mocks/data/orders.ts (new)
  - Purpose: Provide realistic order objects for tests
  - Dependencies: 1.1 complete
  - LOC: ~40
  - 5 realistic order objects
  - Estimate: 15 min

- [x] Task: Create categories fixture data
  - File: tests/mocks/data/categories.ts (new)
  - Purpose: Provide realistic category objects for tests
  - Dependencies: 1.1 complete
  - LOC: ~30
  - 3-5 category objects
  - Estimate: 10 min

#### 1.6 Create Data Factories
- [x] Task: Create book factory
  - File: tests/mocks/factories/book.ts (new)
  - Purpose: Generate test books with faker-js
  - Dependencies: 1.1 complete
  - LOC: ~35
  - createBook(overrides) with faker fields
  - Estimate: 15 min

- [x] Task: Create order factory
  - File: tests/mocks/factories/order.ts (new)
  - Purpose: Generate test orders with faker-js
  - Dependencies: 1.1 complete
  - LOC: ~30
  - Estimate: 10 min

- [x] Task: Create category factory
  - File: tests/mocks/factories/category.ts (new)
  - Purpose: Generate test categories with faker-js
  - Dependencies: 1.1 complete
  - LOC: ~25
  - Estimate: 10 min

#### 1.7 Create Test Utilities
- [x] Task: Create custom render utility
  - File: tests/utils/render.tsx (new)
  - Purpose: Custom RTL render with Next.js router mocks and auth state
  - Dependencies: 1.4 complete (server.ts), 1.3 (vitest.setup)
  - LOC: ~85
  - Features:
    - renderTest(ui, { router?, auth? })
    - Returns { ...render(ui), router }
    - Re-exports all from @testing-library/react
  - Estimate: 40 min

- [x] Task: Create Supabase client mock utilities
  - File: tests/utils/supabase.ts (new)
  - Purpose: Mock Supabase client/server with chainable query builder
  - Dependencies: 1.1 complete
  - LOC: ~75
  - Functions:
    - createMockSupabaseClient()
    - mockSupabaseServerClient()
    - mockSupabaseBrowserClient()
  - Chainable methods: from(), select(), eq(), insert(), update(), delete()
  - Estimate: 45 min

- [x] Task: Create custom matchers
  - File: tests/utils/matchers.ts (new)
  - Purpose: Domain-specific matchers for books, orders, categories
  - Dependencies: 1.1 complete
  - LOC: ~65
  - Matchers: toBeValidBook(), toBeValidOrder(), toBeValidCategory()
  - Estimate: 20 min

- [x] Task: Create auth helpers
  - File: tests/utils/auth-helpers.ts (new)
  - Purpose: Create authenticated requests for API route tests
  - Dependencies: 1.1 complete
  - LOC: ~50
  - Functions:
    - createAuthenticatedRequest(url, options)
    - createRequestWithSession(url, session, options)
  - Estimate: 20 min

#### 1.8 Add Package.json Test Scripts
- [ ] Task: Add test scripts to package.json
  - File: package.json (modify)
  - Purpose: Add npm scripts for all test types
  - Dependencies: 1.1 complete
  - LOC: ~12 added
  - Scripts:
    - test, test:run, test:unit, test:components, test:api
    - test:coverage, test:watch, test:ui
    - test:e2e, test:e2e:ui, test:e2e:debug
    - test:all, test:report, coverage:report
  - Estimate: 10 min

---

### Phase 2: Critical Path Testing (20-32 hours)

#### 2.1 Unit Tests for Utilities

- [x] Task: Create lib/supabase/server tests
  - File: tests/unit/lib/supabase/server.test.ts (new)
  - Purpose: Test Supabase server client creation
  - Dependencies: Phase 1 complete
  - LOC: ~60
  - Tests:
    - Creates client with correct cookies
    - Throws on invalid configuration
  - Estimate: 30 min

- [x] Task: Create lib/supabase/client tests
  - File: tests/unit/lib/supabase/client.test.ts (new)
  - Purpose: Test Supabase browser client singleton
  - Dependencies: Phase 1 complete
  - LOC: ~50
  - Tests:
    - Returns singleton instance
    - Handles missing env vars gracefully
  - Estimate: 25 min

- [ ] Task: Create formatting utility tests
  - File: tests/unit/utils/formatting.test.ts (new)
  - Purpose: Test data formatting functions
  - Dependencies: Phase 1 complete
  - LOC: ~70
  - Tests: Currency, date, slug, price formatting
  - Estimate: 30 min

- [ ] Task: Create validation utility tests
  - File: tests/unit/lib/validation.test.ts (new)
  - Purpose: Test Zod schemas and validation logic
  - Dependencies: Phase 1 complete
  - LOC: ~90
  - Tests:
    - Book schema validation (required fields, types)
    - Order schema validation
    - Category schema validation
    - Valid/invalid cases for each
  - Estimate: 45 min

#### 2.2 API Route Tests

- [x] Task: Create books API route tests
  - File: tests/api/books.test.ts (new)
  - Purpose: Test /api/books GET and POST endpoints
  - Dependencies: Phase 1 complete, MSW handlers
  - LOC: ~180
  - Tests:
    - GET returns list of books
    - POST creates book with valid data
    - POST rejects unauthenticated requests
    - POST validates required fields
    - MSW mocking of Supabase responses
  - Estimate: 90 min

- [x] Task: Create books/[slug] API route tests
  - File: tests/api/books/[slug].test.ts (new)
  - Purpose: Test /api/books/[slug] GET, PATCH, DELETE
  - Dependencies: Phase 1 complete
  - LOC: ~150
  - Tests:
    - GET returns book by slug
    - GET returns 404 for non-existent
    - PATCH updates book
    - DELETE removes book
    - Authentication required checks
  - Estimate: 75 min

- [x] Task: Create orders API route tests
  - File: tests/api/orders.test.ts (new)
  - Purpose: Test /api/orders endpoints
  - Dependencies: Phase 1 complete
  - LOC: ~140
  - Tests: CRUD operations, auth checks, validation
  - Estimate: 70 min

- [x] Task: Create orders/[id] API route tests
  - File: tests/api/orders/[id].test.ts (new)
  - Purpose: Test /api/orders/[id] endpoints
  - Dependencies: Phase 1 complete
  - LOC: ~130
  - Estimate: 65 min

- [ ] Task: Create orders/[id]/items API route tests
  - File: tests/api/orders/[id]/items.test.ts (new)
  - Purpose: Test order items management
  - Dependencies: Phase 1 complete
  - LOC: ~120
  - Tests: Add/remove items from order
  - Estimate: 60 min

- [x] Task: Create categories API route tests
  - File: tests/api/categories.test.ts (new)
  - Purpose: Test /api/categories endpoints
  - Dependencies: Phase 1 complete
  - LOC: ~110
  - Estimate: 55 min

- [x] Task: Create categories/[id] API route tests
  - File: tests/api/categories/[id].test.ts (new)
  - Purpose: Test single category operations
  - Dependencies: Phase 1 complete
  - LOC: ~100
  - Estimate: 50 min

- [x] Task: Create settings API route tests
  - File: tests/api/settings.test.ts (new)
  - Purpose: Test /api/settings endpoints
  - Dependencies: Phase 1 complete
  - LOC: ~90
  - Estimate: 45 min

- [x] Task: Create settings/[key] API route tests
  - File: tests/api/settings/[key].test.ts (new)
  - Purpose: Test single setting operations
  - Dependencies: Phase 1 complete
  - LOC: ~80
  - Estimate: 40 min

#### 2.3 Component Tests

- [x] Task: Create LoginForm component tests
  - File: tests/components/LoginForm.test.tsx (new)
  - Purpose: Test login form behavior
  - Dependencies: Phase 1 complete
  - LOC: ~100
  - Tests:
    - Renders email and password inputs
    - Submits with valid credentials
    - Shows error for invalid credentials
    - Redirects to dashboard after login
    - Handles redirectTo query param
  - Estimate: 50 min

- [x] Task: Create BookFilters component tests
  - File: tests/components/BookFilters.test.tsx (new)
  - Purpose: Test book filtering UI
  - Dependencies: Phase 1 complete
  - LOC: ~90
  - Tests:
    - Renders search input and category select
    - Updates URL with search query
    - Clears filters when button clicked
    - Displays current filters
  - Estimate: 45 min

- [x] Task: Create DeleteBookButton component tests
  - File: tests/components/DeleteBookButton.test.tsx (new)
  - Purpose: Test delete confirmation flow
  - Dependencies: Phase 1 complete
  - LOC: ~80
  - Tests:
    - Shows confirmation dialog
    - Deletes on confirm
    - Cancels on dismiss
    - Shows loading state
  - Estimate: 40 min

- [ ] Task: Create OrderCard component tests
  - File: tests/components/OrderCard.test.tsx (new)
  - Purpose: Test order display component
  - Dependencies: Phase 1 complete
  - LOC: ~70
  - Tests: Order details, status badge, actions
  - Estimate: 35 min

- [ ] Task: Create Dashboard layout component tests
  - File: tests/components/dashboard/Layout.test.tsx (new)
  - Purpose: Test dashboard navigation and auth
  - Dependencies: Phase 1 complete
  - LOC: ~85
  - Tests: Sidebar, header, auth state, navigation
  - Estimate: 45 min

#### 2.4 Integration Tests

- [ ] Task: Create book creation integration test
  - File: tests/integration/book-creation.test.ts (new)
  - Purpose: Test full book creation flow
  - Dependencies: Phase 1 complete, API tests
  - LOC: ~120
  - Tests:
    - Create book via API
    - Verify in database (mocked)
    - Fetch created book
    - Update book
    - Delete book
  - Estimate: 60 min

- [ ] Task: Create order flow integration test
  - File: tests/integration/order-flow.test.ts (new)
  - Purpose: Test order creation and processing
  - Dependencies: Phase 1 complete
  - LOC: ~130
  - Tests:
    - Create order
    - Add items to order
    - Update order status
    - Complete order
  - Estimate: 65 min

---

### Phase 3: E2E Integration (8-12 hours)

#### 3.1 Configure Playwright

- [ ] Task: Install Playwright browsers
  - File: System (command execution)
  - Purpose: Install browser binaries
  - Dependencies: playwright@^1.63.0 already installed
  - LOC: 0 (command: pnpm exec playwright install --with-deps)
  - Estimate: 15 min

- [x] Task: Create playwright.config.ts
  - File: playwright.config.ts (new)
  - Purpose: Configure Playwright for multi-browser E2E tests
  - Dependencies: 3.1 complete
  - LOC: ~127
  - Configuration:
    - Test dir: tests/e2e
    - Base URL: localhost:3000
    - Projects: chromium, firefox, webkit, Mobile Chrome, Mobile Safari
    - Authenticated and admin projects with storageState
    - Retries in CI, parallel execution
    - Trace/screenshot/video on failure
    - webServer: pnpm run dev
  - Estimate: 40 min

#### 3.2 Create E2E Test Setup

- [x] Task: Create auth setup script
  - File: tests/e2e/auth.setup.ts (new) — PR #13: placed at tests/e2e/ root per slice scope (not tests/e2e/setup/)
  - Purpose: Authenticate and save state for E2E tests
  - Dependencies: 3.2 complete
  - LOC: ~40
  - Creates:
    - tests/e2e/.auth/user.json (after login)
    - tests/e2e/.auth/admin.json (after admin login)
  - Estimate: 25 min

- [x] Task: Create .gitignore entry for auth state
  - File: .gitignore (modify) — PR #13: added tests/e2e/.auth/ plus playwright-report/ and test-results/
  - Purpose: Exclude auth state from version control
  - Dependencies: 3.3 complete
  - LOC: ~2
  - Add: tests/e2e/.auth/
  - Estimate: 2 min

#### 3.3 Create E2E Tests

- [x] Task: Create authentication E2E tests
  - File: tests/e2e/auth.spec.ts (new) — PR #14: created
  - Purpose: Test login/logout flows
  - Dependencies: 3.2 complete
  - LOC: ~90
  - Tests:
    - Login page displays
    - Successful login redirects to dashboard
    - Invalid credentials show error
    - Logout clears session
    - Protected routes redirect to login
  - Estimate: 45 min

- [x] Task: Create books catalog E2E tests
  - File: tests/e2e/books.spec.ts (new) — PR #14: created as tests/e2e/catalog.spec.ts per slice scope
  - Purpose: Test public books catalog
  - Dependencies: 3.2 complete
  - LOC: ~80
  - Tests:
    - /catalogo displays books
    - Book cards show title, price
    - Category filter works
    - Search filter works
  - Estimate: 40 min

- [x] Task: Create books CRUD E2E tests (admin)
  - File: tests/e2e/admin/books-crud.spec.ts (new) — PR #14: created
  - Purpose: Test admin book management
  - Dependencies: 3.2 complete, 3.3 complete
  - LOC: ~110
  - Tests:
    - Navigate to /dashboard/libros
    - Create new book
    - Edit existing book
    - Delete book
    - Validation errors
  - Estimate: 55 min

- [x] Task: Create orders management E2E tests
  - File: tests/e2e/admin/orders.spec.ts (new) — PR #14: created
  - Purpose: Test admin order management
  - Dependencies: 3.2 complete, 3.3 complete
  - LOC: ~100
  - Tests:
    - View orders list
    - Filter by status
    - Update order status
    - View order details
  - Estimate: 50 min

- [ ] Task: Create dashboard navigation E2E tests
  - File: tests/e2e/authenticated/dashboard.spec.ts (new)
  - Purpose: Test dashboard navigation
  - Dependencies: 3.2 complete
  - LOC: ~70
  - Tests: Sidebar navigation, active state, mobile menu
  - Estimate: 35 min

#### 3.4 CI Integration

- [ ] Task: Create GitHub Actions workflow
  - File: .github/workflows/test.yml (new)
  - Purpose: Run tests in CI with coverage reporting
  - Dependencies: All phases complete
  - LOC: ~130
  - Jobs:
    - unit-tests: Vitest unit + component tests
    - api-tests: Vitest API route tests
    - e2e-tests: Playwright E2E with PostgreSQL service
    - coverage-report: PR comment with coverage
  - Estimate: 60 min

- [ ] Task: Add CI-specific test configuration
  - File: vitest.config.ts (modify)
  - Purpose: Enable CI-specific settings (bail, reporters)
  - Dependencies: 1.2 complete
  - LOC: ~5 modified
  - Changes:
    - bail: process.env.CI ? 1 : 0
    - reporters: process.env.CI ? ['default', 'github-actions'] : ['default']
  - Estimate: 10 min

---

## 2. File Change Forecast

### Files to CREATE (35 files)

| File | LOC | Purpose |
|------|-----|---------|
| vitest.config.ts | 135 | Vitest configuration for Next.js + React 19 |
| vitest.setup.ts | 75 | Test setup with MSW and Next.js mocks |
| tests/mocks/server.ts | 15 | MSW Node server setup |
| tests/mocks/handlers/index.ts | 10 | Combined handlers export |
| tests/mocks/handlers/auth.ts | 90 | Authentication API mocks |
| tests/mocks/handlers/books.ts | 120 | Books API mocks |
| tests/mocks/handlers/orders.ts | 100 | Orders API mocks |
| tests/mocks/handlers/categories.ts | 80 | Categories API mocks |
| tests/mocks/handlers/settings.ts | 60 | Settings API mocks |
| tests/mocks/data/books.ts | 50 | Book fixture data |
| tests/mocks/data/orders.ts | 40 | Order fixture data |
| tests/mocks/data/categories.ts | 30 | Category fixture data |
| tests/mocks/factories/book.ts | 35 | Book test factory |
| tests/mocks/factories/order.ts | 30 | Order test factory |
| tests/mocks/factories/category.ts | 25 | Category test factory |
| tests/utils/render.tsx | 85 | Custom RTL render with mocks |
| tests/utils/supabase.ts | 75 | Supabase client mocking |
| tests/utils/matchers.ts | 65 | Custom Vitest matchers |
| tests/utils/auth-helpers.ts | 50 | Auth request helpers |
| tests/unit/lib/supabase/server.test.ts | 60 | Server client tests |
| tests/unit/lib/supabase/client.test.ts | 50 | Browser client tests |
| tests/unit/utils/formatting.test.ts | 70 | Formatting utility tests |
| tests/unit/lib/validation.test.ts | 90 | Validation schema tests |
| tests/api/books.test.ts | 180 | Books API route tests |
| tests/api/books/[slug].test.ts | 150 | Book detail API tests |
| tests/api/orders.test.ts | 140 | Orders API route tests |
| tests/api/orders/[id].test.ts | 130 | Order detail API tests |
| tests/api/orders/[id]/items.test.ts | 120 | Order items API tests |
| tests/api/categories.test.ts | 110 | Categories API route tests |
| tests/api/categories/[id].test.ts | 100 | Category detail API tests |
| tests/api/settings.test.ts | 90 | Settings API route tests |
| tests/api/settings/[key].test.ts | 80 | Setting detail API tests |
| tests/components/LoginForm.test.tsx | 100 | Login form tests |
| tests/components/BookFilters.test.tsx | 90 | Book filters tests |
| tests/components/DeleteBookButton.test.tsx | 80 | Delete button tests |
| tests/components/OrderCard.test.tsx | 70 | Order card tests |
| tests/components/dashboard/Layout.test.tsx | 85 | Dashboard layout tests |
| tests/integration/book-creation.test.ts | 120 | Book creation flow test |
| tests/integration/order-flow.test.ts | 130 | Order flow test |
| playwright.config.ts | 127 | Playwright configuration |
| tests/e2e/setup/auth.setup.ts | 40 | Auth state setup |
| tests/e2e/auth.spec.ts | 90 | Authentication E2E tests |
| tests/e2e/books.spec.ts | 80 | Books catalog E2E tests |
| tests/e2e/admin/books-crud.spec.ts | 110 | Admin books E2E tests |
| tests/e2e/admin/orders.spec.ts | 100 | Admin orders E2E tests |
| tests/e2e/authenticated/dashboard.spec.ts | 70 | Dashboard navigation E2E |
| tests/fixtures/README.md | 30 | Test fixtures documentation |
| .github/workflows/test.yml | 130 | CI workflow |
| .vscode/extensions.json | 10 | Recommended extensions |

### Files to MODIFY (2 files)

| File | LOC Changed | Purpose |
|------|-------------|---------|
| package.json | +15 | Add devDependencies and test scripts |
| package.json | +12 | Add test scripts |
| vitest.config.ts | +5 | CI-specific configuration |

### Directory Structure Created

```
tests/
├── unit/
│   ├── lib/
│   │   └── supabase/
│   │       ├── server.test.ts
│   │       └── client.test.ts
│   └── utils/
│       ├── formatting.test.ts
│       └── validation.test.ts
├── components/
│   ├── LoginForm.test.tsx
│   ├── BookFilters.test.tsx
│   ├── DeleteBookButton.test.tsx
│   ├── OrderCard.test.tsx
│   └── dashboard/
│       └── Layout.test.tsx
├── api/
│   ├── books.test.ts
│   ├── orders.test.ts
│   ├── categories.test.ts
│   ├── settings.test.ts
│   ├── books/
│   │   └── [slug].test.ts
│   ├── orders/
│   │   ├── [id].test.ts
│   │   └── [id]/
│   │       └── items.test.ts
│   ├── categories/
│   │   └── [id].test.ts
│   └── settings/
│       └── [key].test.ts
├── integration/
│   ├── book-creation.test.ts
│   └── order-flow.test.ts
├── e2e/
│   ├── .auth/
│   │   ├── user.json (generated)
│   │   └── admin.json (generated)
│   ├── setup/
│   │   └── auth.setup.ts
│   ├── auth.spec.ts
│   ├── books.spec.ts
│   ├── admin/
│   │   ├── books-crud.spec.ts
│   │   └── orders.spec.ts
│   └── authenticated/
│       └── dashboard.spec.ts
├── mocks/
│   ├── handlers/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── books.ts
│   │   ├── orders.ts
│   │   ├── categories.ts
│   │   └── settings.ts
│   ├── data/
│   │   ├── books.ts
│   │   ├── orders.ts
│   │   └── categories.ts
│   ├── factories/
│   │   ├── book.ts
│   │   ├── order.ts
│   │   └── category.ts
│   └── server.ts
└── utils/
    ├── render.tsx
    ├── supabase.ts
    ├── matchers.ts
    ├── auth-helpers.ts
    └── test-context.ts
```

---

## 3. Review Workload Forecast

### Total Lines of Code Estimate

| Category | Files | EST. LOC | Notes |
|----------|-------|----------|-------|
| Configuration | 3 | 337 | vitest.config.ts, vitest.setup.ts, playwright.config.ts |
| MSW Handlers | 6 | 465 | All handler files + server.ts |
| Mock Data/Factories | 6 | 210 | Fixtures and factories |
| Test Utilities | 4 | 275 | render, supabase, matchers, auth-helpers |
| Unit Tests | 4 | 270 | Supabase + utility tests |
| API Tests | 9 | 1100 | All API route tests |
| Component Tests | 5 | 425 | UI component tests |
| Integration Tests | 2 | 250 | Flow tests |
| E2E Tests | 5 | 450 | Playwright tests |
| CI Configuration | 1 | 130 | GitHub Actions workflow |
| **TOTAL** | **51** | **~3,912** | |

### Files by Type

- **New files**: 51
- **Modified files**: 2
- **Total files touched**: 53

### Risk Level

**Risk Level: LOW-MEDIUM**

Reasoning:
- Well-established testing patterns (Vitest + RTL + Playwright)
- Clear design document with code examples
- Modular task breakdown with clear dependencies
- MSW provides isolated testing without external dependencies
- Main risk: Learning curve for team unfamiliar with MSW

### 400-Line Budget Risk

**400-Line Budget Risk: MEDIUM**

Analysis:
- Single largest file: tests/api/books.test.ts (~180 LOC)
- Most files under 150 LOC
- Phase 1 (Foundation): ~1,287 LOC total, needs 4+ PRs
- Phase 2 (Critical Path): ~1,945 LOC total, needs 5+ PRs  
- Phase 3 (E2E): ~873 LOC total, needs 2-3 PRs

**Chained PRs RECOMMENDED**: YES

Recommended PR breakdown:
1. PR 1: Vitest config + setup + package.json (~225 LOC)
2. PR 2: MSW handlers - auth + books (~210 LOC)
3. PR 3: MSW handlers - orders + categories + settings (~240 LOC)
4. PR 4: Mock data + factories (~210 LOC)
5. PR 5: Test utilities (~275 LOC)
6. PR 6: Unit tests (~270 LOC)
7. PR 7: API tests - books (~330 LOC)
8. PR 8: API tests - orders (~390 LOC)
9. PR 9: API tests - categories + settings (~380 LOC)
10. PR 10: Component tests - forms (~280 LOC)
11. PR 11: Component tests - dashboard + integration (~425 LOC)
12. PR 12: Playwright config + auth setup (~167 LOC)
13. PR 13: E2E tests - auth + public (~170 LOC)
14. PR 14: E2E tests - admin (~210 LOC)
15. PR 15: CI workflow (~130 LOC)

### Decision Needed Before Apply

**Decision: NO**

Reason:
- Design document provides complete implementation details
- All code examples are production-ready
- No architectural ambiguity
- Clear rollback strategy (remove test files)
- No external service dependencies during testing (MSW)

---

## 4. Task Dependencies (DAG)

```
Phase 1 Foundation
├─ 1.1 Install Dependencies (no deps)
├─ 1.2 Configure Vitest (depends on 1.1)
├─ 1.3 Vitest Setup File (depends on 1.1, 1.4)
├─ 1.4 MSW Server Setup (depends on 1.1)
│   ├─ 1.4.1 Create server.ts
│   └─ 1.4.2 Create handlers/index.ts
├─ 1.5 Auth Handler (depends on 1.1, server.ts)
├─ 1.6 Books Handler (depends on 1.1, data/books.ts)
├─ 1.7 Orders Handler (depends on 1.1, data/orders.ts)
├─ 1.8 Categories Handler (depends on 1.1, data/categories.ts)
├─ 1.9 Settings Handler (depends on 1.1)
├─ 1.10-1.12 Mock Data (depends on 1.1, parallel)
├─ 1.13-1.15 Factories (depends on 1.1, parallel)
├─ 1.16-1.19 Test Utilities (depends on 1.3, 1.4, parallel)
└─ 1.20 Package.json Scripts (depends on 1.1)

Phase 2 Critical Path (depends on Phase 1)
├─ 2.1 Unit Tests (parallel)
│   ├─ 2.1.1 server.test.ts
│   ├─ 2.1.2 client.test.ts
│   ├─ 2.1.3 formatting.test.ts
│   └─ 2.1.4 validation.test.ts
├─ 2.2 API Tests (parallel after unit)
│   ├─ 2.2.1 books.test.ts (depends on MSW books handler)
│   ├─ 2.2.2 books/[slug].test.ts
│   ├─ 2.2.3-2.6 orders, categories, settings tests (parallel)
└─ 2.3 Component Tests (parallel)
    ├─ 2.3.1 LoginForm.test.tsx
    ├─ 2.3.2 BookFilters.test.tsx
    └─ 2.3.3-2.3.5 Other components (parallel)

Phase 3 E2E (depends on Phase 2)
├─ 3.1 Playwright Browsers (no deps)
├─ 3.2 Playwright Config (depends on 3.1)
├─ 3.3 Auth Setup (depends on 3.2)
├─ 3.4 E2E Tests (depends on 3.3)
│   ├─ 3.4.1 auth.spec.ts
│   ├─ 3.4.2 books.spec.ts
│   ├─ 3.4.3 admin/books-crud.spec.ts
│   ├─ 3.4.4 admin/orders.spec.ts
│   └─ 3.4.5 authenticated/dashboard.spec.ts
└─ 3.5 CI Workflow (depends on all phases)
```

### Critical Path

**1.1 → 1.2 → 1.3/1.4 → 1.16-1.19 → 2.2.1 → 2.3.1 → 3.2 → 3.3 → 3.4.1 → 3.5**

Total: ~11 sequential steps

---

## 5. Quick Wins

Tasks that provide **immediate value** after completion:

### Quick Win 1: Foundation + First Test (Day 1)
**Tasks**: 1.1, 1.2, 1.3, 1.4, 1.5, 1.10, 1.16, 1.20 + 2.1.1

**Result**:
- `pnpm test` runs successfully
- First test passes (lib/supabase/server.test.ts)
- Full Vitest + MSW infrastructure in place
- Immediate feedback loop

**LOC**: ~455  
**Time**: 4-5 hours

### Quick Win 2: First API Route Test (Day 2)
**Tasks**: 1.6, 1.16, 2.2.1

**Result**:
- Books API fully tested (GET, POST)
- MSW handlers for books working
- Demonstrates API testing pattern for team

**LOC**: ~300  
**Time**: 2-3 hours

### Quick Win 3: First Component Test (Day 2-3)
**Tasks**: 1.17, 2.3.1

**Result**:
- LoginForm component tested
- Custom render utility validated
- Pattern for other component tests

**LOC**: ~185  
**Time**: 1.5 hours

### Quick Win 4: First E2E Test (Day 4)
**Tasks**: 3.1, 3.2, 3.3, 3.4.1

**Result**:
- Playwright running in CI
- Auth flow E2E test passing
- Established E2E testing pattern

**LOC**: ~257  
**Time**: 2 hours

---

## 6. Sequential vs Parallel Execution

### Sequential Dependencies (MUST run in order)

1. **Phase 1 before Phase 2**: Foundation must complete before tests
2. **Phase 2 before Phase 3**: Unit/API tests before E2E
3. **MSW handlers before API tests**: Can't test APIs without mocks
4. **Test utilities before component tests**: Custom render needed
5. **Playwright config before E2E tests**: Setup required
6. **Auth setup before authenticated E2E tests**: State persistence
7. **All tests before CI workflow**: Need passing tests first

### Can Run in Parallel

**Phase 1 Batch 1** (after 1.1):
- 1.2 (vitest.config.ts)
- 1.4.1 (server.ts)
- 1.10-1.12 (mock data)
- 1.13-1.15 (factories)

**Phase 1 Batch 2** (after 1.4.1):
- 1.5 (auth handler)
- 1.6 (books handler) [needs 1.10]
- 1.7 (orders handler) [needs 1.11]
- 1.8 (categories handler) [needs 1.12]
- 1.9 (settings handler)

**Phase 2 Unit Tests**:
- All 2.1.x can run in parallel

**Phase 2 API Tests**:
- All 2.2.x can run in parallel (after unit tests)

**Phase 2 Component Tests**:
- All 2.3.x can run in parallel

**Phase 3 E2E Tests**:
- 3.4.1-3.4.5 can run in parallel (after auth setup)

### Recommended Execution Strategy

**Option A: Waterfall by Phase** (safer, slower)
- Complete Phase 1 entirely
- Complete Phase 2 entirely
- Complete Phase 3 entirely
- Total time: 40-60 hours

**Option B: Parallel by Type** (faster, more coordination)
- Day 1: Foundation (all Phase 1 in parallel batches)
- Day 2: Unit tests + first API tests (parallel)
- Day 3: Remaining API tests + component tests (parallel)
- Day 4: E2E tests (parallel)
- Day 5: CI integration
- Total time: 32-40 hours

**Option C: Incremental Value** (recommended)
- Quick Win 1 (4-5h): Foundation + first test
- Quick Win 2 (2-3h): First API test
- Quick Win 3 (1.5h): First component test
- Continue with remaining tests in parallel
- Quick Win 4 (2h): First E2E test
- Complete remaining tasks
- Total time: 35-45 hours with regular value delivery

---

## 7. Testing Strategy Summary

### Unit Tests (Phase 2.1)
- **Scope**: Utilities, helpers, Supabase clients
- **Speed**: Fast (< 1s per test)
- **Isolation**: Full MSW mocking, no DB
- **Coverage target**: 50% overall

### Component Tests (Phase 2.3)
- **Scope**: UI components with user interactions
- **Speed**: Medium (1-2s per test)
- **Isolation**: MSW + mocked hooks
- **Coverage target**: 50% overall

### API Tests (Phase 2.2)
- **Scope**: Next.js API routes
- **Speed**: Medium (1-3s per test)
- **Isolation**: MSW mocking Supabase REST API
- **Coverage target**: 60% API routes, 70% critical paths

### E2E Tests (Phase 3)
- **Scope**: Full user flows, auth, CRUD
- **Speed**: Slow (5-30s per test)
- **Isolation**: Real dev server + production DB (test)
- **Coverage target**: Critical paths only

### Test Coverage Thresholds

| Code Area | Lines | Functions | Branches |
|-----------|-------|-----------|----------|
| Critical (books, orders, supabase) | 70% | 70% | 65% |
| API Routes | 60% | 60% | 55% |
| Overall | 50% | 50% | 45% |

---

## 8. Rollback Strategy

If testing infrastructure causes issues:

### Level 1: Failing Tests
- Fix specific test files
- No infrastructure changes needed
- Time: < 30 min

### Level 2: Configuration Issues
- Revert vitest.config.ts or vitest.setup.ts
- Remove MSW handlers temporarily
- Tests will fail but app runs
- Time: < 1 hour

### Level 3: Dependency Conflicts
- Remove test devDependencies from package.json
- Delete tests/ directory
- Delete vitest.config.ts, vitest.setup.ts, playwright.config.ts
- Remove test scripts from package.json
- Time: < 2 hours

### Level 4: Complete Removal
- Delete all test-related files and folders
- Remove from CI workflow
- App returns to pre-testing state
- Time: < 4 hours

---

## 9. Post-Implementation Checklist

After all tasks complete:

- [ ] `pnpm test:run` passes with > 0 tests
- [ ] `pnpm test:unit` passes with > 4 tests
- [ ] `pnpm test:api` passes with > 9 tests
- [ ] `pnpm test:components` passes with > 5 tests
- [ ] `pnpm test:coverage` shows > 50% overall
- [ ] `pnpm test:e2e` passes with > 5 tests
- [ ] `pnpm test:all` runs without errors
- [ ] CI workflow runs in GitHub Actions
- [ ] Coverage report posted to PR
- [ ] Test utilities documented in README
- [ ] Team has run tests locally successfully

---

## Summary

- **Total tasks**: 51 tasks across 3 phases
- **Estimated new/changed lines**: ~3,912 LOC
- **Files to create**: 51 new files
- **Files to modify**: 2 files (package.json x2)
- **Risk level**: Low-Medium
- **Chained PRs recommended**: YES (14 PRs recommended)
- **400-line budget risk**: Medium (requires 14+ PRs)
- **Decision needed before apply**: NO
- **Estimated total time**: 40-60 hours
- **Earliest quick win**: 4-5 hours (foundation + first test)
- **Sequential steps**: 11 critical path steps
- **Parallelizable work**: 30+ tasks can run in parallel within phases

This task breakdown provides a clear roadmap for implementing a professional testing infrastructure in eralibros, with actionable estimates, dependency tracking, and risk mitigation strategies.
