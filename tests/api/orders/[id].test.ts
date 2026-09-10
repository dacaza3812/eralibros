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
import { GET, PATCH } from '@/app/api/orders/[id]/route';

function singleResult(data: unknown, error: unknown = null) {
  return vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data, error })),
    })),
  }));
}

function patchRequest(id: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000/api/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('API /api/orders/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetOrdersStore();
  });

  describe('GET', () => {
    it('returns order by ID with items', async () => {
      const mockOrder = {
        id: 'order-1',
        customer_name: 'Maria Garcia',
        total_amount: 44.98,
        status: 'pendiente',
        items: [{ id: 'item-1', book_id: 'book-1', quantity: 2 }],
      };
      mockClient.from.mockReturnValue({ select: singleResult(mockOrder) });

      const request = new NextRequest('http://localhost:3000/api/orders/order-1');
      const response = await GET(request, {
        params: Promise.resolve({ id: 'order-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('order-1');
      expect(data.customer_name).toBe('Maria Garcia');
      expect(mockClient.from).toHaveBeenCalledWith('orders');
    });

    it('returns 404 when order does not exist', async () => {
      mockClient.from.mockReturnValue({ select: singleResult(null) });

      const request = new NextRequest(
        'http://localhost:3000/api/orders/missing',
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'missing' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Pedido no encontrado');
    });

    it('handles internal server errors', async () => {
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/orders/order-1');
      const response = await GET(request, {
        params: Promise.resolve({ id: 'order-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('PATCH', () => {
    it('updates order status with valid data', async () => {
      const updated = { id: 'order-1', status: 'confirmado', notes: null };
      mockClient.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: updated, error: null }),
              ),
            })),
          })),
        })),
      });

      const response = await PATCH(patchRequest('order-1', { status: 'confirmado' }), {
        params: Promise.resolve({ id: 'order-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('confirmado');
      expect(mockClient.from).toHaveBeenCalledWith('orders');
    });

    it('rejects an invalid status with 400', async () => {
      const response = await PATCH(patchRequest('order-1', { status: 'shipped' }), {
        params: Promise.resolve({ id: 'order-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Estado inválido');
    });

    it('rejects an empty update with 400', async () => {
      const response = await PATCH(patchRequest('order-1', {}), {
        params: Promise.resolve({ id: 'order-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No hay campos para actualizar');
    });

    it('returns 400 when the update fails', async () => {
      mockClient.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: null,
                  error: { message: 'Order not found' },
                }),
              ),
            })),
          })),
        })),
      });

      const response = await PATCH(patchRequest('order-1', { status: 'enviado' }), {
        params: Promise.resolve({ id: 'order-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Order not found');
    });

    it('handles internal server errors', async () => {
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await PATCH(patchRequest('order-1', { status: 'enviado' }), {
        params: Promise.resolve({ id: 'order-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
