import { faker } from '@faker-js/faker';
import type { MockOrder } from '../data/orders';

// Statuses mirror the real API (`app/api/orders/route.ts`):
// 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'.
const ORDER_STATUSES = [
  'pendiente',
  'confirmado',
  'enviado',
  'entregado',
  'cancelado',
] as const;

export function createOrder(overrides: Partial<MockOrder> = {}): MockOrder {
  const now = new Date().toISOString();

  return {
    id: faker.string.uuid(),
    customer_name: faker.person.fullName(),
    customer_phone: faker.phone.number(),
    customer_email: faker.internet.email(),
    total_amount: parseFloat(faker.commerce.price({ min: 5, max: 200 })),
    status: faker.helpers.arrayElement(ORDER_STATUSES),
    notes: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}
