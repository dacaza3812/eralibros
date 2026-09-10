import { NextRequest } from 'next/server';

/**
 * Create an authenticated request with session cookies.
 */
export function createAuthenticatedRequest(
  url: string,
  options?: RequestInit,
): NextRequest {
  const headers = new Headers(options?.headers);
  headers.set(
    'Cookie',
    'sb-access-token=mock-access-token; sb-refresh-token=mock-refresh-token',
  );

  return new NextRequest(new Request(url, { ...options, headers }));
}

/**
 * Create a request with specific session data.
 */
export function createRequestWithSession(
  url: string,
  session: { userId: string; email: string },
  options?: RequestInit,
): NextRequest {
  const sessionCookie = Buffer.from(
    JSON.stringify({
      user: { id: session.userId, email: session.email },
      access_token: 'mock-access-token',
    }),
  ).toString('base64');

  const headers = new Headers(options?.headers);
  headers.set('Cookie', `sb-session=${sessionCookie}`);

  return new NextRequest(new Request(url, { ...options, headers }));
}
