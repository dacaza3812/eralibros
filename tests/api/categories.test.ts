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
import { GET, POST } from '@/app/api/categories/route';

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockGetList(data: unknown, error: unknown = null) {
  mockClient.from.mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data, error })),
      })),
    })),
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

function mockInsert(data: unknown, error: unknown = null) {
  mockClient.from.mockReturnValue({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data, error })),
      })),
    })),
  });
}

describe('API /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCategoriesStore();
  });

  describe('GET', () => {
    it('returns active categories with flattened book counts', async () => {
      const mockCategories = [
        {
          id: 'cat-ficcion',
          name: 'Ficcion',
          slug: 'ficcion',
          description: 'Novels and short stories.',
          order_index: 0,
          is_active: true,
          created_at: '2026-01-05T10:00:00.000Z',
          updated_at: '2026-01-05T10:00:00.000Z',
          books: [{ count: 3 }],
        },
        {
          id: 'cat-ensayo',
          name: 'Ensayo',
          slug: 'ensayo',
          description: 'Essays and non-fiction.',
          order_index: 1,
          is_active: true,
          created_at: '2026-01-05T10:00:00.000Z',
          updated_at: '2026-01-05T10:00:00.000Z',
          books: [{ count: 0 }],
        },
      ];
      mockGetList(mockCategories);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].slug).toBe('ficcion');
      expect(data[0].book_count).toBe(3);
      expect(data[0].books).toBeUndefined();
      expect(data[1].book_count).toBe(0);
      expect(mockClient.from).toHaveBeenCalledWith('categories');
    });

    it('returns 500 when the Supabase query fails', async () => {
      mockGetList(null, { message: 'Database connection failed' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al obtener categorías');
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

  describe('POST', () => {
    it('creates a new category with valid data', async () => {
      mockAuthenticated();
      const created = {
        id: 'cat-new',
        name: 'Poesia',
        slug: 'poesia',
        description: 'Poems and verse.',
        order_index: 2,
        is_active: true,
        created_at: '2026-02-01T10:00:00.000Z',
        updated_at: '2026-02-01T10:00:00.000Z',
      };
      mockInsert(created);

      const response = await POST(
        postRequest({ name: 'Poesia', slug: 'poesia' }),
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.slug).toBe('poesia');
      expect(data.is_active).toBe(true);
      expect(mockClient.from).toHaveBeenCalledWith('categories');
    });

    it('rejects unauthenticated requests with 401', async () => {
      mockUnauthenticated();

      const response = await POST(
        postRequest({ name: 'Poesia', slug: 'poesia' }),
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autorizado');
    });

    it('rejects requests missing name or slug with 400', async () => {
      mockAuthenticated();

      const response = await POST(postRequest({ name: 'Sin slug' }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nombre y slug son requeridos');
    });

    it('returns 409 when the slug already exists', async () => {
      mockAuthenticated();
      mockInsert(null, { code: '23505', message: 'duplicate key value' });

      const response = await POST(
        postRequest({ name: 'Ficcion', slug: 'ficcion' }),
      );
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Ya existe una categoría con ese slug');
    });

    it('returns 500 when the insert fails', async () => {
      mockAuthenticated();
      mockInsert(null, { message: 'Database unavailable' });

      const response = await POST(
        postRequest({ name: 'Poesia', slug: 'poesia' }),
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al crear categoría');
    });
  });
});
