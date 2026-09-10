import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { resetOrdersStore } from '@/tests/mocks/handlers/orders';

// Mock the server client before importing the route
const mockClient = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

// Import routes after mocking
import { GET, POST } from '@/app/api/orders/route';

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function bookLookup(data: unknown, error: unknown = null) {
  return vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data, error })),
    })),
  }));
}

// Wire from() so POST resolves the full chain:
// books lookup -> orders insert -> order_items insert -> orders re-fetch.
function mockPostFlow(options: {
  book?: unknown;
  bookError?: unknown;
  createdOrder: unknown;
  completeOrder?: unknown;
  itemsError?: unknown;
  onOrderInsert?: (payload: unknown) => void;
  onItemsInsert?: (payload: unknown) => void;
}) {
  const {
    book = null,
    bookError = null,
    createdOrder,
    completeOrder,
    itemsError = null,
    onOrderInsert,
    onItemsInsert,
  } = options;

  mockClient.from.mockImplementation((table: string) => {
    if (table === 'books') {
      return { select: bookLookup(book, bookError) };
    }
    if (table === 'orders') {
      return {
        insert: vi.fn((payload: unknown) => {
          onOrderInsert?.(payload);
          return {
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: createdOrder, error: null }),
              ),
            })),
          };
        }),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: completeOrder ?? createdOrder,
                error: null,
              }),
            ),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      };
    }
    return {
      insert: vi.fn((payload: unknown) => {
        onItemsInsert?.(payload);
        return Promise.resolve({ data: null, error: itemsError });
      }),
    };
  });
}

describe('API /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetOrdersStore();
  });

  describe('GET', () => {
    it('returns list of orders with items', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          customer_name: 'Maria Garcia',
          total_amount: 44.98,
          status: 'pendiente',
          items: [],
        },
        {
          id: 'order-2',
          customer_name: 'Juan Perez',
          total_amount: 19.99,
          status: 'entregado',
          items: [],
        },
      ];
      mockClient.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockOrders, error: null })),
        })),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].customer_name).toBe('Maria Garcia');
      expect(mockClient.from).toHaveBeenCalledWith('orders');
    });

    it('returns 400 when Supabase query fails', async () => {
      mockClient.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          ),
        })),
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
    it('creates an order when stock is sufficient', async () => {
      const book = {
        id: 'book-1',
        title: 'Test Book',
        stock_quantity: 10,
        stock_type: 'impreso_listo',
        price: 19.99,
      };
      const createdOrder = { id: 'order-new', customer_name: 'Ana Lopez' };
      const completeOrder = { ...createdOrder, total_amount: 39.98, items: [] };
      mockPostFlow({ book, createdOrder, completeOrder });

      const response = await POST(
        postRequest({
          customer_name: 'Ana Lopez',
          items: [{ book_id: 'book-1', quantity: 2, unit_price: 19.99 }],
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total_amount).toBe(39.98);
      expect(mockClient.from).toHaveBeenCalledWith('orders');
    });

    it('rejects with 400 when stock is insufficient', async () => {
      mockPostFlow({
        book: {
          id: 'book-1',
          title: 'Test Book',
          stock_quantity: 1,
          stock_type: 'impreso_listo',
          price: 19.99,
        },
        createdOrder: { id: 'order-new' },
      });

      const response = await POST(
        postRequest({
          customer_name: 'Ana Lopez',
          items: [{ book_id: 'book-1', quantity: 5, unit_price: 19.99 }],
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Stock insuficiente');
    });

    it('skips stock check for bajo_demanda books', async () => {
      const createdOrder = { id: 'order-demand', customer_name: 'Luis Ruiz' };
      const completeOrder = { ...createdOrder, total_amount: 199.9, items: [] };
      mockPostFlow({
        book: {
          id: 'book-demand',
          title: 'On Demand Book',
          stock_quantity: 0,
          stock_type: 'bajo_demanda',
          price: 19.99,
        },
        createdOrder,
        completeOrder,
      });

      const response = await POST(
        postRequest({
          customer_name: 'Luis Ruiz',
          items: [{ book_id: 'book-demand', quantity: 10, unit_price: 19.99 }],
        }),
      );

      expect(response.status).toBe(200);
    });

    it('auto-sets unit_price from book price when not provided', async () => {
      let insertedItems: Array<{ unit_price: number }> | null = null as unknown as Array<{ unit_price: number }> | null;
      mockPostFlow({
        book: {
          id: 'book-1',
          title: 'Test Book',
          stock_quantity: 10,
          stock_type: 'impreso_listo',
          price: 24.5,
        },
        createdOrder: { id: 'order-auto' },
        completeOrder: { id: 'order-auto', total_amount: 49 },
        onItemsInsert: (payload) => {
          insertedItems = payload as Array<{ unit_price: number }>;
        },
      });

      const response = await POST(
        postRequest({
          customer_name: 'Eva Martin',
          items: [{ book_id: 'book-1', quantity: 2 }],
        }),
      );

      expect(response.status).toBe(200);
      expect(insertedItems?.[0].unit_price).toBe(24.5);
    });

    it('returns 400 when customer_name is missing', async () => {
      const response = await POST(
        postRequest({ items: [{ book_id: 'book-1', quantity: 1 }] }),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nombre del cliente e items son requeridos');
    });

    it('returns 400 when the book does not exist', async () => {
      mockPostFlow({
        book: null,
        bookError: { message: 'No rows found' },
        createdOrder: { id: 'order-new' },
      });

      const response = await POST(
        postRequest({
          customer_name: 'Ana Lopez',
          items: [{ book_id: 'missing-book', quantity: 1, unit_price: 9.99 }],
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Libro no encontrado');
    });
  });
});
