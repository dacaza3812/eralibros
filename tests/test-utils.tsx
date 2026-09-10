import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// Mock Next.js router hooks
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

// Helper to create mock search params
export function createMockSearchParams(params: Record<string, string> = {}) {
  return new URLSearchParams(params);
}

// Helper to create mock router
export function createMockRouter(overrides = {}) {
  return {
    ...mockRouter,
    ...overrides,
  };
}

// Provider wrapper for tests
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: Partial<ReturnType<typeof createMockRouter>>;
  searchParams?: Record<string, string>;
}

function TestProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Custom render with providers
export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { router: routerOptions, searchParams, ...renderOptions } = options;

  // Apply router mocks if provided
  if (routerOptions) {
    vi.mocked(mockRouter.push).mockImplementation(routerOptions.push || vi.fn());
    vi.mocked(mockRouter.replace).mockImplementation(routerOptions.replace || vi.fn());
  }

  return render(ui, {
    wrapper: TestProviders,
    ...renderOptions,
  });
}

// Re-export from testing library
export * from '@testing-library/react';
export { customRender as render };
