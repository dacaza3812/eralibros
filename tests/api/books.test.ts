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
import { GET, POST } from '@/app/api/books/route';

describe('API /api/books', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetBooksStore();
  });

  describe('GET', () => {
    it('returns list of books from Supabase', async () => {
      const mockBooks = [
        {
          id: 'book-1',
          slug: 'test-book-1',
          title: 'Test Book 1',
          description: 'Description 1',
          author: 'Author 1',
          year: 2024,
          isbn: '9780000000001',
          price: 19.99,
          category_id: null,
          stock_type: 'impreso_listo',
          stock_quantity: 10,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          categories: { name: 'Fiction' },
          images: [],
        },
        {
          id: 'book-2',
          slug: 'test-book-2',
          title: 'Test Book 2',
          description: 'Description 2',
          author: 'Author 2',
          year: 2023,
          isbn: '9780000000002',
          price: 24.99,
          category_id: null,
          stock_type: 'impreso_listo',
          stock_quantity: 5,
          is_active: true,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          categories: { name: 'Non-Fiction' },
          images: [],
        },
      ];

      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockBooks, error: null })),
      }));

      mockClient.from.mockReturnValue({
        select: mockSelect,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].title).toBe('Test Book 1');
      expect(data[1].title).toBe('Test Book 2');
      expect(mockClient.from).toHaveBeenCalledWith('books');
    });

    it('returns error when Supabase query fails', async () => {
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() =>
          Promise.resolve({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        ),
      }));

      mockClient.from.mockReturnValue({
        select: mockSelect,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Database connection failed');
    });

    it('handles internal server errors', async () => {
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST', () => {
    it('creates a new book with valid data', async () => {
      const newBookData = {
        title: 'New Test Book',
        slug: 'new-test-book',
        description: 'A new book for testing',
        author: 'Test Author',
        year: 2024,
        isbn: '9780000000003',
        price: 29.99,
        category_id: null,
        stock_type: 'impreso_listo',
        stock_quantity: 15,
        is_active: true,
      };

      const createdBook = {
        id: 'new-book-id',
        ...newBookData,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      };

      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: createdBook, error: null }),
          ),
        })),
      }));

      mockClient.from.mockReturnValue({
        insert: mockInsert,
      });

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('New Test Book');
      expect(data.slug).toBe('new-test-book');
      expect(mockClient.from).toHaveBeenCalledWith('books');
    });

    it('creates book with minimal required fields', async () => {
      const minimalBookData = {
        title: 'Minimal Book',
        slug: 'minimal-book',
      };

      const createdBook = {
        id: 'minimal-book-id',
        title: 'Minimal Book',
        slug: 'minimal-book',
        description: null,
        author: null,
        year: null,
        isbn: null,
        price: null,
        category_id: null,
        stock_type: 'impreso_listo',
        stock_quantity: 0,
        is_active: true,
        created_at: '2024-01-04T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: createdBook, error: null }),
          ),
        })),
      }));

      mockClient.from.mockReturnValue({
        insert: mockInsert,
      });

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalBookData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Minimal Book');
      expect(data.stock_type).toBe('impreso_listo');
      expect(data.stock_quantity).toBe(0);
    });

    it('returns error when Supabase insert fails', async () => {
      const newBookData = {
        title: 'Failed Book',
        slug: 'failed-book',
      };

      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Duplicate slug violation' },
            }),
          ),
        })),
      }));

      mockClient.from.mockReturnValue({
        insert: mockInsert,
      });

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Duplicate slug violation');
    });

    it('rejects request with invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('sets default values for optional fields', async () => {
      const partialBookData = {
        title: 'Partial Book',
        slug: 'partial-book',
        year: 2024,
      };

      let insertedData: Record<string, unknown> | null = null as unknown as Record<string, unknown> | null;

      const mockInsert = vi.fn((data) => {
        insertedData = data;
        return {
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { id: 'partial-id', ...data },
                error: null,
              }),
            ),
          })),
        };
      });

      mockClient.from.mockReturnValue({
        insert: mockInsert,
      });

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialBookData),
      });

      await POST(request);

      expect(insertedData?.description).toBe(null);
      expect(insertedData?.author).toBe(null);
      expect(insertedData?.stock_type).toBe('impreso_listo');
      expect(insertedData?.stock_quantity).toBe(0);
      expect(insertedData?.is_active).toBe(true);
    });
  });
});
