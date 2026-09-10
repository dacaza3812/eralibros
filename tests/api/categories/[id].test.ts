import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { resetCategoriesStore } from '@/tests/mocks/handlers/categories';

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

// Import routes after mocking
import { GET, PATCH, DELETE } from '@/app/api/categories/[id]/route';

function singleResult(data: unknown, error: unknown = null) {
  return vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data, error })),
    })),
  }));
}

function patchRequest(id: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000/api/categories/${id}`, {
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

describe('API /api/categories/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCategoriesStore();
  });

  describe('GET', () => {
    it('returns the category by ID with flattened book count', async () => {
      const mockCategory = {
        id: 'cat-ficcion',
        name: 'Ficcion',
        slug: 'ficcion',
        description: 'Novels and short stories.',
        order_index: 0,
        is_active: true,
        created_at: '2026-01-05T10:00:00.000Z',
        updated_at: '2026-01-05T10:00:00.000Z',
        books: [{ count: 3 }],
      };
      mockClient.from.mockReturnValue({ select: singleResult(mockCategory) });

      const request = new NextRequest(
        'http://localhost:3000/api/categories/cat-ficcion',
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'cat-ficcion' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('cat-ficcion');
      expect(data.book_count).toBe(3);
      expect(data.books).toBeUndefined();
      expect(mockClient.from).toHaveBeenCalledWith('categories');
    });

    it('returns 404 when the category does not exist', async () => {
      mockClient.from.mockReturnValue({
        select: singleResult(null, { code: 'PGRST116', message: 'No rows' }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/categories/missing',
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'missing' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Categoría no encontrada');
    });

    it('handles internal server errors', async () => {
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest(
        'http://localhost:3000/api/categories/cat-ficcion',
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'cat-ficcion' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno del servidor');
    });
  });

  describe('PATCH', () => {
    it('updates the category with valid data', async () => {
      mockAuthenticated();
      const updated = { id: 'cat-ficcion', name: 'Ficcion Actualizada' };
      mockUpdateSingle(updated);

      const response = await PATCH(
        patchRequest('cat-ficcion', { name: 'Ficcion Actualizada' }),
        { params: Promise.resolve({ id: 'cat-ficcion' }) },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Ficcion Actualizada');
      expect(mockClient.from).toHaveBeenCalledWith('categories');
    });

    it('rejects unauthenticated requests with 401', async () => {
      mockUnauthenticated();

      const response = await PATCH(
        patchRequest('cat-ficcion', { name: 'Ficcion' }),
        { params: Promise.resolve({ id: 'cat-ficcion' }) },
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autorizado');
    });

    it('rejects an empty update with 400', async () => {
      mockAuthenticated();

      const response = await PATCH(patchRequest('cat-ficcion', {}), {
        params: Promise.resolve({ id: 'cat-ficcion' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No hay campos para actualizar');
    });

    it('returns 409 when the new slug already exists', async () => {
      mockAuthenticated();
      mockUpdateSingle(null, { code: '23505', message: 'duplicate key' });

      const response = await PATCH(
        patchRequest('cat-ficcion', { slug: 'ensayo' }),
        { params: Promise.resolve({ id: 'cat-ficcion' }) },
      );
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Ya existe una categoría con ese slug');
    });
  });

  describe('DELETE', () => {
    it('soft-deletes the category by setting is_active to false', async () => {
      mockAuthenticated();
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }));
      mockClient.from.mockReturnValue({ update: mockUpdate });

      const request = new NextRequest(
        'http://localhost:3000/api/categories/cat-ficcion',
        { method: 'DELETE' },
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'cat-ficcion' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ is_active: false });
      expect(mockClient.from).toHaveBeenCalledWith('categories');
    });

    it('rejects unauthenticated requests with 401', async () => {
      mockUnauthenticated();

      const request = new NextRequest(
        'http://localhost:3000/api/categories/cat-ficcion',
        { method: 'DELETE' },
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'cat-ficcion' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autorizado');
    });

    it('returns 500 when the soft-delete fails', async () => {
      mockAuthenticated();
      mockClient.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() =>
            Promise.resolve({ error: { message: 'Delete failed' } }),
          ),
        })),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/categories/cat-ficcion',
        { method: 'DELETE' },
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'cat-ficcion' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al eliminar categoría');
    });
  });
});
