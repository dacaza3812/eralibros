export interface MockOrder {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const initialOrders: MockOrder[] = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    customer_name: 'Maria Garcia',
    customer_phone: '+34600111222',
    customer_email: 'maria@example.com',
    total_amount: 44.98,
    status: 'pendiente',
    notes: null,
    created_at: '2026-04-01T10:00:00.000Z',
    updated_at: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    customer_name: 'Juan Perez',
    customer_phone: null,
    customer_email: null,
    total_amount: 19.99,
    status: 'entregado',
    notes: 'Gift wrap requested',
    created_at: '2026-03-10T10:00:00.000Z',
    updated_at: '2026-03-12T10:00:00.000Z',
  },
];
