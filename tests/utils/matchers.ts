import { expect } from 'vitest';

// Statuses mirror the real API (`app/api/orders/route.ts`):
// 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'.
const VALID_ORDER_STATUSES = [
  'pendiente',
  'confirmado',
  'enviado',
  'entregado',
  'cancelado',
];

expect.extend({
  toBeValidBook(received: unknown) {
    const book = received as Record<string, unknown>;
    const pass =
      typeof book?.id === 'string' &&
      typeof book?.title === 'string' &&
      typeof book?.slug === 'string' &&
      typeof book?.is_active === 'boolean';

    return {
      pass,
      message: () =>
        pass
          ? 'expected value not to be a valid book'
          : 'expected value to be a valid book (id: string, title: string, slug: string, is_active: boolean)',
    };
  },

  toBeValidOrder(received: unknown) {
    const order = received as Record<string, unknown>;
    const pass =
      typeof order?.id === 'string' &&
      typeof order?.customer_name === 'string' &&
      VALID_ORDER_STATUSES.includes(order?.status as string);

    return {
      pass,
      message: () =>
        pass
          ? 'expected value not to be a valid order'
          : `expected value to be a valid order (id: string, customer_name: string, status: one of ${VALID_ORDER_STATUSES.join(', ')})`,
    };
  },

  toBeValidCategory(received: unknown) {
    const category = received as Record<string, unknown>;
    const pass =
      typeof category?.id === 'string' &&
      typeof category?.name === 'string' &&
      typeof category?.order_index === 'number' &&
      typeof category?.is_active === 'boolean';

    return {
      pass,
      message: () =>
        pass
          ? 'expected value not to be a valid category'
          : 'expected value to be a valid category (id: string, name: string, order_index: number, is_active: boolean)',
    };
  },
});

// NOTE: No `declare module 'vitest'` augmentation here on purpose.
// @testing-library/jest-dom v7 augments Assertion with ONE type param (T)
// while vitest 5 declares Assertion with TWO (R, T). Any source-level
// augmentation conflicts with one of them (TS2428), so custom matchers
// stay runtime-only until jest-dom supports vitest 5's signature.
