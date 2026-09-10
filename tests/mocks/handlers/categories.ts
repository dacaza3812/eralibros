import { http, HttpResponse, delay } from 'msw';
import { initialCategories, type MockCategory } from '../data/categories';

// NOTE: Wildcard host (`*/rest/...`) is used instead of
// `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/...` so handlers match
// any Supabase project URL and keep working when env vars are unset (CI).
//
// NOTE: Seed data lives in `tests/mocks/data/categories.ts`;
// `resetCategoriesStore()` restores the in-memory store from it.

let categoriesStore: MockCategory[] = [...initialCategories];

// Supabase REST filters use operators such as `id=eq.<id>`
function stripOperator(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.replace(/^eq\./, '');
}

export const categoriesHandlers = [
  // GET /rest/v1/categories - List all, or single category when `id` is given.
  // (Single handler on purpose: MSW matches the first registered handler,
  // so a second identical GET route for the id filter would be unreachable.)
  http.get('*/rest/v1/categories', async ({ request }) => {
    const url = new URL(request.url);
    const id = stripOperator(url.searchParams.get('id'));

    if (id) {
      const category = categoriesStore.find((c) => c.id === id);

      if (!category) {
        return HttpResponse.json(
          { error: 'Category not found' },
          { status: 404 },
        );
      }

      await delay(30);
      return HttpResponse.json(category);
    }

    await delay(50);
    return HttpResponse.json(categoriesStore);
  }),

  // POST /rest/v1/categories - Create category
  http.post('*/rest/v1/categories', async ({ request }) => {
    const body = (await request.json()) as Partial<MockCategory>;
    await delay(100);

    if (!body.name || !body.slug) {
      return HttpResponse.json(
        { error: 'name and slug are required' },
        { status: 400 },
      );
    }

    if (categoriesStore.some((c) => c.slug === body.slug)) {
      return HttpResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const newCategory: MockCategory = {
      id: crypto.randomUUID(),
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      order_index: body.order_index ?? 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: now,
      updated_at: now,
    };

    categoriesStore.push(newCategory);

    return HttpResponse.json(newCategory, { status: 201 });
  }),

  // PATCH /rest/v1/categories?id=eq.<id> - Update category
  http.patch('*/rest/v1/categories', async ({ request }) => {
    const url = new URL(request.url);
    const id = stripOperator(url.searchParams.get('id'));
    const body = (await request.json()) as Partial<MockCategory>;

    const index = categoriesStore.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }

    categoriesStore[index] = {
      ...categoriesStore[index],
      ...body,
      updated_at: new Date().toISOString(),
    };

    await delay(50);
    return HttpResponse.json(categoriesStore[index]);
  }),

  // DELETE /rest/v1/categories?id=eq.<id> - Delete category
  http.delete('*/rest/v1/categories', async ({ request }) => {
    const url = new URL(request.url);
    const id = stripOperator(url.searchParams.get('id'));

    const index = categoriesStore.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }

    categoriesStore.splice(index, 1);
    await delay(50);

    return new HttpResponse(null, { status: 204 });
  }),
];

// Helper to reset the in-memory store (for test isolation)
export const resetCategoriesStore = (): void => {
  categoriesStore = [...initialCategories];
};
