import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createAuthenticatedRequest } from '@/tests/utils/auth-helpers';
import { resetBooksStore } from '@/tests/mocks/handlers/books';
import { createBook } from '@/tests/mocks/factories/book';

// Mock the server client before importing the route
const mockClient = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

// Import routes after mocking
import { GET, PATCH } from '@/app/api/books/[slug]/route';

describe('API /api/books/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetBooksStore();
  });

  describe('GET', () => {
    it('returns book by slug with relations', async () => {
      const mockBook = {
        id: 'book-1',
        slug: 'test-book-slug',
        title: 'Test Book',
        description: 'Test description',
        author: 'Test Author',
        year: 2024,
        isbn: '9780000000001',
        price: 19.99,
        category_id: 'cat-1',
        stock_type: 'impreso_listo',
        stock_quantity: 10,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        categories: { id: 'cat-1', name: 'Fiction' },
        images: [
          {
            id: 'img-1',
            image_url: 'https://example.com/image.jpg',
            image_path: 'books/image.jpg',
            order_index: 0,
          },
        ],
      };

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: mockBook, error: null }),
          ),
        })),
      }));

      mockClient.from.mockReturnValue({
        select: mockSelect,
      });

      const request = new NextRequest('http://localhost:3000/api/books/test-book-slug');
      const params = Promise.resolve({ slug: 'test-book-slug' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.slug).toBe('test-book-slug');
      expect(data.title).toBe('Test Book');
      expect(data.categories.name).toBe('Fiction');
      expect(data.images).toHaveLength(1);
      expect(mockClient.from).toHaveBeenCalledWith('books');
    });

    it('returns 404 for non-existent book', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'No rows found' },
            }),
          ),
        })),
      }));

      mockClient.from.mockReturnValue({
        select: mockSelect,
      });

      const request = new NextRequest('http://localhost:3000/api/books/non-existent');
      const params = Promise.resolve({ slug: 'non-existent' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('No rows found');
    });

    it('handles internal server errors', async () => {
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/books/error-book');
      const params = Promise.resolve({ slug: 'error-book' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('includes images ordered by order_index', async () => {
      const mockBook = {
        id: 'book-images',
        slug: 'book-with-images',
        title: 'Book With Images',
        description: null,
        author: null,
        year: null,
        isbn: null,
        price: null,
        category_id: null,
        stock_type: 'impreso_listo',
        stock_quantity: 5,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        categories: null,
        images: [
          {
            id: 'img-2',
            image_url: 'https://example.com/image2.jpg',
            image_path: 'books/image2.jpg',
            order_index: 0,
          },
          {
            id: 'img-1',
            image_url: 'https://example.com/image1.jpg',
            image_path: 'books/image1.jpg',
            order_index: 1,
          },
        ],
      };

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: mockBook, error: null }),
          ),
        })),
      }));

      mockClient.from.mockReturnValue({
        select: mockSelect,
      });

      const request = new NextRequest('http://localhost:3000/api/books/book-with-images');
      const params = Promise.resolve({ slug: 'book-with-images' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.images).toHaveLength(2);
    });
  });

  describe('PATCH', () => {
    it('updates book with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        price: 39.99,
        stock_quantity: 20,
      };

      const updatedBook = {
        id: 'book-update',
        slug: 'update-slug',
        title: 'Updated Title',
        description: 'Original description',
        author: 'Original Author',
        year: 2023,
        isbn: '9780000000009',
        price: 39.99,
        category_id: null,
        stock_type: 'impreso_listo',
        stock_quantity: 20,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z',
      };

      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: updatedBook, error: null }),
            ),
          })),
        })),
      }));

      mockClient.from.mockReturnValue({
        update: mockUpdate,
      });

      const request = new NextRequest('http://localhost:3000/api/books/update-slug', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const params = Promise.resolve({ slug: 'update-slug' });

      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Updated Title');
      expect(data.price).toBe(39.99);
      expect(data.stock_quantity).toBe(20);
      expect(mockClient.from).toHaveBeenCalledWith('books');
    });

    it('updates slug field', async () => {
      const updateData = {
        slug: 'new-slug-value',
      };

      const updatedBook = {
        id: 'book-slug-update',
        slug: 'new-slug-value',
        title: 'Book Title',
        description: null,
        author: null,
        year: null,
        isbn: null,
        price: null,
        category_id: null,
        stock_type: 'impreso_listo',
        stock_quantity: 0,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-06T00:00:00Z',
      };

      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: updatedBook, error: null }),
            ),
          })),
        })),
      }));

      mockClient.from.mockReturnValue({
        update: mockUpdate,
      });

      const request = new NextRequest('http://localhost:3000/api/books/old-slug', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const params = Promise.resolve({ slug: 'old-slug' });

      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.slug).toBe('new-slug-value');
    });

    it('returns 400 when update fails', async () => {
      const updateData = {
        title: 'Failed Update',
      };

      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: 'Book not found' },
              }),
            ),
          })),
        })),
      }));

      mockClient.from.mockReturnValue({
        update: mockUpdate,
      });

      const request = new NextRequest('http://localhost:3000/api/books/non-existent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const params = Promise.resolve({ slug: 'non-existent' });

      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Book not found');
    });

    it('handles internal server errors', async () => {
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/books/error-slug', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Error' }),
      });
      const params = Promise.resolve({ slug: 'error-slug' });

      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('sets null for optional empty fields', async () => {
      const updateData = {
        title: 'Book With Nulls',
        description: '',
        author: '',
      };

      let updatedPayload: Record<string, unknown> | null = null as unknown as Record<string, unknown> | null;

      const mockUpdate = vi.fn((data) => {
        updatedPayload = data;
        return {
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { id: 'null-book', ...data },
                  error: null,
                }),
              ),
            })),
          })),
        };
      });

      mockClient.from.mockReturnValue({
        update: mockUpdate,
      });

      const request = new NextRequest('http://localhost:3000/api/books/null-fields', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const params = Promise.resolve({ slug: 'null-fields' });

      await PATCH(request, { params });

      expect(updatedPayload?.description).toBe(null);
      expect(updatedPayload?.author).toBe(null);
    });
  });
});
