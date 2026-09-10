import { http, HttpResponse, delay } from 'msw';

// NOTE: Wildcard host (`*/auth/...`) is used instead of
// `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/...` so handlers match
// any Supabase project URL and keep working when env vars are unset (CI).

interface MockUser {
  id: string;
  email: string;
  role: string;
}

interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: MockUser;
}

const DEFAULT_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
const DEFAULT_EMAIL = 'admin@eralibros.com';
const DEFAULT_PASSWORD = 'password123';

let currentSession: MockSession | null = null;

function createSession(email: string = DEFAULT_EMAIL): MockSession {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: DEFAULT_USER_ID,
      email,
      role: 'authenticated',
    },
  };
}

export const authHandlers = [
  // POST /auth/v1/token?grant_type=password - Sign in
  http.post('*/auth/v1/token', async ({ request }) => {
    const url = new URL(request.url);
    const grantType = url.searchParams.get('grant_type');
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    await delay(100);

    if (grantType === 'password') {
      if (body.email === DEFAULT_EMAIL && body.password === DEFAULT_PASSWORD) {
        currentSession = createSession(body.email);
        return HttpResponse.json(currentSession);
      }

      return HttpResponse.json(
        { error: 'Invalid login credentials' },
        { status: 400 },
      );
    }

    return HttpResponse.json({ error: 'Invalid grant type' }, { status: 400 });
  }),

  // GET /auth/v1/session - Get current session
  http.get('*/auth/v1/session', async () => {
    await delay(20);

    if (!currentSession) {
      return HttpResponse.json({ error: 'No session found' }, { status: 401 });
    }

    return HttpResponse.json({
      session: currentSession,
      user: currentSession.user,
    });
  }),

  // POST /auth/v1/logout - Sign out
  http.post('*/auth/v1/logout', async () => {
    await delay(50);
    currentSession = null;
    return new HttpResponse(null, { status: 204 });
  }),
];

// Helper to set an authenticated state for tests
export const setAuthenticated = (email: string = DEFAULT_EMAIL): void => {
  currentSession = createSession(email);
};

// Helper to clear authentication between tests
export const clearAuthentication = (): void => {
  currentSession = null;
};
