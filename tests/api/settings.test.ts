import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetSettingsStore } from '@/tests/mocks/handlers/settings';

// Mock the server client before importing the route
const mockClient = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

// Import route after mocking
import { GET } from '@/app/api/settings/route';

function mockGetSettings(data: unknown, error: unknown = null) {
  mockClient.from.mockReturnValue({
    select: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({ data, error })),
    })),
  });
}

describe('API /api/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSettingsStore();
  });

  describe('GET', () => {
    it('returns settings mapped by key with value, description, and updated_at', async () => {
      const mockSettings = [
        {
          key: 'store_name',
          value: 'Eralibros',
          description: 'Public store name.',
          updated_at: '2026-01-05T10:00:00.000Z',
        },
        {
          key: 'whatsapp_number',
          value: '34600111222',
          description: 'Store WhatsApp contact number.',
          updated_at: '2026-01-05T10:00:00.000Z',
        },
      ];
      mockGetSettings(mockSettings);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.store_name.value).toBe('Eralibros');
      expect(data.store_name.description).toBe('Public store name.');
      expect(data.store_name.updated_at).toBe('2026-01-05T10:00:00.000Z');
      expect(data.whatsapp_number.value).toBe('34600111222');
      expect(mockClient.from).toHaveBeenCalledWith('settings');
    });

    it('returns 500 when the Supabase query fails', async () => {
      mockGetSettings(null, { message: 'Database connection failed' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al obtener configuración');
    });

    it('handles internal server errors', async () => {
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno del servidor');
    });
  });
});
