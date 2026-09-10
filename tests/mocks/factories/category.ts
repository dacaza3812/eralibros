import { faker } from '@faker-js/faker';
import type { MockCategory } from '../data/categories';

export function createCategory(
  overrides: Partial<MockCategory> = {},
): MockCategory {
  const now = new Date().toISOString();
  const name = faker.commerce.department();

  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: faker.lorem.sentence(),
    order_index: faker.number.int({ min: 0, max: 20 }),
    is_active: true,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}
