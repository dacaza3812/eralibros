import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCookies, mockGetAll, mockSet, mockCreateServerClient } =
  vi.hoisted(() => {
    const mockGetAll = vi.fn();
    const mockSet = vi.fn();
    const mockCookies = vi.fn();
    const mockCreateServerClient = vi.fn();
    return { mockCookies, mockGetAll, mockSet, mockCreateServerClient };
  });

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}));

import { createClient } from '@/lib/supabase/server';

const TEST_URL = 'https://test.supabase.co';
const TEST_KEY = 'test-publishable-key';

const ORIGINAL_ENV = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

interface CookieToSet {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

function getCookieHandlers() {
  const options = mockCreateServerClient.mock.calls[0][2] as {
    cookies: {
      getAll: () => Array<{ name: string; value: string }>;
      setAll: (cookiesToSet: CookieToSet[]) => void;
    };
  };
  return options.cookies;
}

describe('lib/supabase/server createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = TEST_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = TEST_KEY;
    mockGetAll.mockReturnValue([
      { name: 'sb-access-token', value: 'access-123' },
    ]);
    mockSet.mockImplementation(() => undefined);
    mockCookies.mockResolvedValue({ getAll: mockGetAll, set: mockSet });
    mockCreateServerClient.mockReturnValue({ from: vi.fn() });
  });

  it('creates a server client with the configured URL and publishable key', async () => {
    await createClient();

    expect(mockCreateServerClient).toHaveBeenCalledTimes(1);
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      TEST_URL,
      TEST_KEY,
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
  });

  it('reads the cookie store once per call', async () => {
    await createClient();

    expect(mockCookies).toHaveBeenCalledTimes(1);
  });

  it('delegates getAll to the Next.js cookie store', async () => {
    await createClient();
    const handlers = getCookieHandlers();

    const result = handlers.getAll();

    expect(mockGetAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ name: 'sb-access-token', value: 'access-123' }]);
  });

  it('forwards every setAll cookie to the Next.js cookie store', async () => {
    await createClient();
    const handlers = getCookieHandlers();

    handlers.setAll([
      { name: 'sb-access-token', value: 'new-access', options: { path: '/' } },
      { name: 'sb-refresh-token', value: 'new-refresh', options: {} },
    ]);

    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenNthCalledWith(
      1,
      'sb-access-token',
      'new-access',
      { path: '/' },
    );
    expect(mockSet).toHaveBeenNthCalledWith(
      2,
      'sb-refresh-token',
      'new-refresh',
      {},
    );
  });

  it('ignores cookie write errors from Server Components', async () => {
    mockSet.mockImplementation(() => {
      throw new Error('Cookies can only be modified in a Server Action');
    });
    await createClient();
    const handlers = getCookieHandlers();

    expect(() =>
      handlers.setAll([{ name: 'sb-access-token', value: 'x' }]),
    ).not.toThrow();
    expect(mockSet).toHaveBeenCalledTimes(1);
  });

  it('handles an empty setAll list without touching the store', async () => {
    await createClient();
    const handlers = getCookieHandlers();

    handlers.setAll([]);

    expect(mockSet).not.toHaveBeenCalled();
  });

  it('returns the client produced by createServerClient', async () => {
    const supabaseClient = { from: vi.fn() };
    mockCreateServerClient.mockReturnValue(supabaseClient);

    const result = await createClient();

    expect(result).toBe(supabaseClient);
  });

  it('propagates configuration errors from createServerClient', async () => {
    mockCreateServerClient.mockImplementation(() => {
      throw new Error('Invalid Supabase configuration');
    });

    await expect(createClient()).rejects.toThrow(
      'Invalid Supabase configuration',
    );
  });

  it('forwards the current env values on every call', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://other.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'other-key';

    await createClient();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://other.supabase.co',
      'other-key',
      expect.anything(),
    );

    process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_ENV.url;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ORIGINAL_ENV.key;
  });
});
