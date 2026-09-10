import { http, HttpResponse, delay } from 'msw';
import { initialOrders, type MockOrder } from '../data/orders';

// NOTE: Wildcard host (`*/rest/...`) is used instead of
// `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/...` so handlers match
// any Supabase project URL and keep working when env vars are unset (CI).
//
// NOTE: Seed data lives in `tests/mocks/data/orders.ts`;
// `resetOrdersStore()` restores the in-memory store from it.
//
// Statuses mirror the real API (`app/api/orders/route.ts`):
// 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'.

const VALID_STATUSES = [
  'pendiente',
  'confirmado',
  'enviado',
  'entregado',
  'cancelado',
];

let ordersStore: MockOrder[] = [...initialOrders];

// Supabase REST filters use operators such as `id=eq.<uuid>`
function stripOperator(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.replace(/^eq\./, '');
}

export const ordersHandlers = [
  // GET /rest/v1/orders - List all orders, or single order when `id` is given.
  // (Single handler on purpose: MSW matches the first registered handler,
  // so a second identical GET route for the id filter would be unreachable.)
  http.get('*/rest/v1/orders', async ({ request }) => {
    const url = new URL(request.url);
    const id = stripOperator(url.searchParams.get('id'));

    if (id) {
      const order = ordersStore.find((o) => o.id === id);

      if (!order) {
        return HttpResponse.json(
          { error: 'Order not found' },
          { status: 404 },
        );
      }

      await delay(30);
      return HttpResponse.json(order);
    }

    await delay(50);
    return HttpResponse.json(ordersStore);
  }),

  // POST /rest/v1/orders - Create order
  http.post('*/rest/v1/orders', async ({ request }) => {
    const body = (await request.json()) as Partial<MockOrder>;
    await delay(100);

    if (!body.customer_name) {
      return HttpResponse.json(
        { error: 'customer_name is required' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const newOrder: MockOrder = {
      id: crypto.randomUUID(),
      customer_name: body.customer_name,
      customer_phone: body.customer_phone ?? null,
      customer_email: body.customer_email ?? null,
      total_amount: body.total_amount ?? 0,
      status: body.status ?? 'pendiente',
      notes: body.notes ?? null,
      created_at: now,
      updated_at: now,
    };

    ordersStore.push(newOrder);

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // PATCH /rest/v1/orders?id=eq.<id> - Update order (status, notes)
  http.patch('*/rest/v1/orders', async ({ request }) => {
    const url = new URL(request.url);
    const id = stripOperator(url.searchParams.get('id'));
    const body = (await request.json()) as Partial<MockOrder>;

    const index = ordersStore.findIndex((o) => o.id === id);

    if (index === -1) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return HttpResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    ordersStore[index] = {
      ...ordersStore[index],
      ...body,
      updated_at: new Date().toISOString(),
    };

    await delay(50);
    return HttpResponse.json(ordersStore[index]);
  }),

  // DELETE /rest/v1/orders?id=eq.<id> - Delete order
  http.delete('*/rest/v1/orders', async ({ request }) => {
    const url = new URL(request.url);
    const id = stripOperator(url.searchParams.get('id'));

    const index = ordersStore.findIndex((o) => o.id === id);

    if (index === -1) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    ordersStore.splice(index, 1);
    await delay(50);

    return new HttpResponse(null, { status: 204 });
  }),
];

// Helper to reset the in-memory store (for test isolation)
export const resetOrdersStore = (): void => {
  ordersStore = [...initialOrders];
};
