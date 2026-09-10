import { vi } from 'vitest';

/**
 * Create a mock Supabase client with a chainable query builder.
 *
 * Every link in the chain is a `vi.fn()`, so tests can override
 * resolved values per test with `mockResolvedValue`, e.g.:
 *
 *   vi.mocked(client.from('books').select).mockResolvedValue({ data: [], error: null })
 */
export function createMockSupabaseClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null }),
      ),
      signInWithPassword: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null }),
      ),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        download: vi.fn(() => Promise.resolve({ data: null, error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/image.jpg' },
        })),
      })),
    },
  };
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

/**
 * Point `@/lib/supabase/server` at a mock client for this test file.
 * Call before dynamically importing the module under test:
 *
 *   const client = await mockSupabaseServerClient();
 *   const { createClient } = await import('@/lib/supabase/server');
 */
export function mockSupabaseServerClient() {
  const client = createMockSupabaseClient();
  vi.doMock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(client)),
  }));
  return client;
}

/**
 * Point `@/lib/supabase/client` at a mock client for this test file.
 * Call before dynamically importing the module under test:
 *
 *   const client = mockSupabaseBrowserClient();
 *   const { createClient } = await import('@/lib/supabase/client');
 */
export function mockSupabaseBrowserClient() {
  const client = createMockSupabaseClient();
  vi.doMock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => client),
  }));
  return client;
}
