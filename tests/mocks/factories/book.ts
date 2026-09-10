import { faker } from '@faker-js/faker';
import type { MockBook } from '../data/books';

export function createBook(overrides: Partial<MockBook> = {}): MockBook {
  const now = new Date().toISOString();

  return {
    id: faker.string.uuid(),
    slug: faker.lorem.slug(),
    title: faker.book.title(),
    description: faker.lorem.sentence(),
    author: faker.person.fullName(),
    year: faker.number.int({ min: 1900, max: 2026 }),
    isbn: faker.commerce.isbn(),
    price: parseFloat(faker.commerce.price({ min: 5, max: 60 })),
    category_id: null,
    stock_type: 'impreso_listo',
    stock_quantity: faker.number.int({ min: 0, max: 100 }),
    is_active: true,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}
