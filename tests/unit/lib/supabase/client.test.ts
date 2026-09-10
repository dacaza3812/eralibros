import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateBrowserClient } = vi.hoisted(() => {
  const mockCreateBrowserClient = vi.fn();
  return { mockCreateBrowserClient };
});

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: mockCreateBrowserClient,
}));

import { createClient } from '@/lib/supabase/client';

const TEST_URL = 'https://test.supabase.co';
const TEST_KEY = 'test-publishable-key';

describe('lib/supabase/client createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = TEST_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = TEST_KEY;
    mockCreateBrowserClient.mockReturnValue({ auth: {} });
  });

  it('creates a browser client with the configured URL and publishable key', () => {
    createClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(TEST_URL, TEST_KEY);
  });

  it('returns the client produced by createBrowserClient', () => {
    const browserClient = { auth: { getSession: vi.fn() } };
    mockCreateBrowserClient.mockReturnValue(browserClient);

    const result = createClient();

    expect(result).toBe(browserClient);
  });

  it('creates a fresh client on every call', () => {
    const first = { id: 1 };
    const second = { id: 2 };
    mockCreateBrowserClient
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second);

    expect(createClient()).toBe(first);
    expect(createClient()).toBe(second);
    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2);
  });

  it('forwards the current env values on every call', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://other.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'other-key';

    createClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://other.supabase.co',
      'other-key',
    );
  });

  it('propagates configuration errors from createBrowserClient', () => {
    mockCreateBrowserClient.mockImplementation(() => {
      throw new Error('Missing Supabase environment variables');
    });

    expect(() => createClient()).toThrow(
      'Missing Supabase environment variables',
    );
  });
});
