import { http, HttpResponse, delay } from 'msw';

// NOTE: Wildcard host (`*/rest/...`) is used instead of
// `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/...` so handlers match
// any Supabase project URL and keep working when env vars are unset (CI).
//
// NOTE: Settings are keyed by `key` (not `id`); filters look like
// `key=eq.whatsapp_number`.

interface MockSetting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

const initialSettings: MockSetting[] = [
  {
    key: 'whatsapp_number',
    value: '34600111222',
    description: 'Store WhatsApp contact number.',
    updated_at: '2026-01-05T10:00:00.000Z',
  },
  {
    key: 'store_name',
    value: 'Eralibros',
    description: 'Public store name.',
    updated_at: '2026-01-05T10:00:00.000Z',
  },
];

let settingsStore: MockSetting[] = [...initialSettings];

// Supabase REST filters use operators such as `key=eq.<key>`
function stripOperator(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.replace(/^eq\./, '');
}

export const settingsHandlers = [
  // GET /rest/v1/settings - List all, or single setting when `key` is given.
  // (Single handler on purpose: MSW matches the first registered handler,
  // so a second identical GET route for the key filter would be unreachable.)
  http.get('*/rest/v1/settings', async ({ request }) => {
    const url = new URL(request.url);
    const key = stripOperator(url.searchParams.get('key'));

    if (key) {
      const setting = settingsStore.find((s) => s.key === key);

      if (!setting) {
        return HttpResponse.json(
          { error: 'Setting not found' },
          { status: 404 },
        );
      }

      await delay(30);
      return HttpResponse.json(setting);
    }

    await delay(50);
    return HttpResponse.json(settingsStore);
  }),

  // PATCH /rest/v1/settings?key=eq.<key> - Update setting value
  http.patch('*/rest/v1/settings', async ({ request }) => {
    const url = new URL(request.url);
    const key = stripOperator(url.searchParams.get('key'));
    const body = (await request.json()) as Partial<MockSetting>;

    const index = settingsStore.findIndex((s) => s.key === key);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Setting not found' },
        { status: 404 },
      );
    }

    if (body.value === undefined || body.value === null) {
      return HttpResponse.json(
        { error: 'value is required' },
        { status: 400 },
      );
    }

    settingsStore[index] = {
      ...settingsStore[index],
      value: body.value,
      updated_at: new Date().toISOString(),
    };

    await delay(50);
    return HttpResponse.json(settingsStore[index]);
  }),
];

// Helper to reset the in-memory store (for test isolation)
export const resetSettingsStore = (): void => {
  settingsStore = [...initialSettings];
};
