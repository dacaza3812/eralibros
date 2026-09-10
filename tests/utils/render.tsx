import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  clearAuthentication,
  setAuthenticated,
} from '../mocks/handlers/auth';

export interface RenderRouterOptions {
  pathname?: string;
  query?: Record<string, string>;
}

export interface RenderAuthOptions {
  authenticated?: boolean;
  email?: string;
}

export interface RenderTestOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: RenderRouterOptions;
  auth?: RenderAuthOptions;
}

function createRouterMock() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  };
}

export type MockRouter = ReturnType<typeof createRouterMock>;

/**
 * Custom render that installs per-test Next.js router mocks and
 * optionally sets MSW auth state before rendering.
 *
 * Auth is only touched when `options.auth` is provided, so tests
 * that do not care about auth keep whatever state previous
 * setup left behind.
 */
export function renderTest(ui: ReactElement, options: RenderTestOptions = {}) {
  const { router = {}, auth, ...renderOptions } = options;
  const routerMock = createRouterMock();

  vi.mocked(useRouter).mockReturnValue(
    routerMock as unknown as ReturnType<typeof useRouter>,
  );
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(router.query ?? {}) as unknown as ReturnType<
      typeof useSearchParams
    >,
  );
  vi.mocked(usePathname).mockReturnValue(router.pathname ?? '/');

  if (auth) {
    if (auth.authenticated) {
      setAuthenticated(auth.email);
    } else {
      clearAuthentication();
    }
  }

  return { ...render(ui, renderOptions), router: routerMock };
}

export * from '@testing-library/react';
export { renderTest as render };
