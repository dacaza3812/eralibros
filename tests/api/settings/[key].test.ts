import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { resetSettingsStore } from '@/tests/mocks/handlers/settings';

// Mock the server client before importing the route
const mockClient = {
  from: vi.fn(),
  auth: {
    getSession: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

// Import route after mocking
// NOTE: this route only exports PATCH (no GET by key exists in the source).
import { PATCH } from '@/app/api/settings/[key]/route';

function patchRequest(key: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000/api/settings/${key}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockAuthenticated() {
  mockClient.auth.getSession.mockResolvedValue({
    data: { session: { user: { id: 'user-1' } } },
    error: null,
  });
}

function mockUnauthenticated() {
  mockClient.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
}

function mockUpdateSingle(data: unknown, error: unknown = null) {
  mockClient.from.mockReturnValue({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data, error })),
        })),
      })),
    })),
  });
}

describe('API /api/settings/[key]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSettingsStore();
  });

  describe('PATCH', () => {
    it('updates a generic setting with a valid value', async () => {
      mockAuthenticated();
      const updated = {
        key: 'store_name',
        value: 'Eralibros Nuevo',
        description: 'Public store name.',
        updated_at: '2026-02-01T10:00:00.000Z',
      };
      mockUpdateSingle(updated);

      const response = await PATCH(patchRequest('store_name', { value: 'Eralibros Nuevo' }), {
        params: Promise.resolve({ key: 'store_name' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.value).toBe('Eralibros Nuevo');
      expect(mockClient.from).toHaveBeenCalledWith('settings');
    });

    it('accepts a whatsapp_number with at least 8 digits after stripping non-digits', async () => {
      mockAuthenticated();
      const updated = {
        key: 'whatsapp_number',
        value: '+34 600 111 222',
        description: 'Store WhatsApp contact number.',
        updated_at: '2026-02-01T10:00:00.000Z',
      };
      mockUpdateSingle(updated);

      const response = await PATCH(
        patchRequest('whatsapp_number', { value: '+34 600 111 222' }),
        { params: Promise.resolve({ key: 'whatsapp_number' }) },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.value).toBe('+34 600 111 222');
    });

    it('accepts a whatsapp_message_template containing the {titulo} placeholder', async () => {
      mockAuthenticated();
      const updated = {
        key: 'whatsapp_message_template',
        value: 'Hola, me interesa {titulo}',
        description: null,
        updated_at: '2026-02-01T10:00:00.000Z',
      };
      mockUpdateSingle(updated);

      const response = await PATCH(
        patchRequest('whatsapp_message_template', {
          value: 'Hola, me interesa {titulo}',
        }),
        { params: Promise.resolve({ key: 'whatsapp_message_template' }) },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.value).toContain('{titulo}');
    });

    it('rejects unauthenticated requests with 401', async () => {
      mockUnauthenticated();

      const response = await PATCH(patchRequest('store_name', { value: 'Eralibros' }), {
        params: Promise.resolve({ key: 'store_name' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autorizado');
    });

    it('rejects requests missing the value with 400', async () => {
      mockAuthenticated();

      const response = await PATCH(patchRequest('store_name', {}), {
        params: Promise.resolve({ key: 'store_name' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('El valor es requerido');
    });

    it('rejects a whatsapp_number with fewer than 8 digits with 400', async () => {
      mockAuthenticated();

      const response = await PATCH(patchRequest('whatsapp_number', { value: '123-45' }), {
        params: Promise.resolve({ key: 'whatsapp_number' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('El número de WhatsApp debe tener al menos 8 dígitos');
    });

    it('rejects a whatsapp_message_template without the {titulo} placeholder with 400', async () => {
      mockAuthenticated();

      const response = await PATCH(
        patchRequest('whatsapp_message_template', { value: 'Hola, me interesa este libro' }),
        { params: Promise.resolve({ key: 'whatsapp_message_template' }) },
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('La plantilla debe incluir el placeholder {titulo}');
    });

    it('returns 404 when the setting does not exist', async () => {
      mockAuthenticated();
      mockUpdateSingle(null, { code: 'PGRST116', message: 'No rows' });

      const response = await PATCH(patchRequest('missing_key', { value: 'x' }), {
        params: Promise.resolve({ key: 'missing_key' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Configuración no encontrada');
    });

    it('returns 500 when the update fails', async () => {
      mockAuthenticated();
      mockUpdateSingle(null, { message: 'Database unavailable' });

      const response = await PATCH(patchRequest('store_name', { value: 'Eralibros' }), {
        params: Promise.resolve({ key: 'store_name' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al actualizar configuración');
    });

    it('handles internal server errors', async () => {
      mockAuthenticated();
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await PATCH(patchRequest('store_name', { value: 'Eralibros' }), {
        params: Promise.resolve({ key: 'store_name' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno del servidor');
    });
  });
});
