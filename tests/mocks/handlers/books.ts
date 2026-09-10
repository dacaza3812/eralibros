import { http, HttpResponse, delay } from 'msw';
import { initialBooks, type MockBook } from '../data/books';

// NOTE: Wildcard host (`*/rest/...`) is used instead of
// `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/...` so handlers match
// any Supabase project URL and keep working when env vars are unset (CI).
//
// NOTE: Seed data lives in `tests/mocks/data/books.ts`;
// `resetBooksStore()` restores the in-memory store from it.

let booksStore: MockBook[] = [...initialBooks];

// Supabase REST filters use operators such as `slug=eq.my-slug`
function stripOperator(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.replace(/^eq\./, '');
}

export const booksHandlers = [
  // GET /rest/v1/books - List all books, or single book when `slug` is given.
  // (Single handler on purpose: MSW matches the first registered handler,
  // so a second identical GET route for the slug filter would be unreachable.)
  http.get('*/rest/v1/books', async ({ request }) => {
    const url = new URL(request.url);
    const slug = stripOperator(url.searchParams.get('slug'));

    if (slug) {
      const book = booksStore.find((b) => b.slug === slug);

      if (!book) {
        return HttpResponse.json(
          { error: 'Book not found' },
          { status: 404 },
        );
      }

      await delay(30);
      return HttpResponse.json(book);
    }

    await delay(50);
    return HttpResponse.json(booksStore);
  }),

  // POST /rest/v1/books - Create book
  http.post('*/rest/v1/books', async ({ request }) => {
    const body = (await request.json()) as Partial<MockBook>;
    await delay(100);

    const now = new Date().toISOString();
    const newBook: MockBook = {
      id: crypto.randomUUID(),
      slug: body.slug ?? `book-${Date.now()}`,
      title: body.title ?? 'Untitled',
      description: body.description ?? null,
      author: body.author ?? null,
      year: body.year ?? null,
      isbn: body.isbn ?? null,
      price: body.price ?? null,
      category_id: body.category_id ?? null,
      stock_type: body.stock_type ?? 'impreso_listo',
      stock_quantity: body.stock_quantity ?? 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: now,
      updated_at: now,
    };

    booksStore.push(newBook);

    return HttpResponse.json(newBook, { status: 201 });
  }),

  // PATCH /rest/v1/books?slug=eq.<slug> - Update book
  http.patch('*/rest/v1/books', async ({ request }) => {
    const url = new URL(request.url);
    const slug = stripOperator(url.searchParams.get('slug'));
    const body = (await request.json()) as Partial<MockBook>;

    const index = booksStore.findIndex((b) => b.slug === slug);

    if (index === -1) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    booksStore[index] = {
      ...booksStore[index],
      ...body,
      updated_at: new Date().toISOString(),
    };

    await delay(50);
    return HttpResponse.json(booksStore[index]);
  }),

  // DELETE /rest/v1/books?slug=eq.<slug> - Delete book
  http.delete('*/rest/v1/books', async ({ request }) => {
    const url = new URL(request.url);
    const slug = stripOperator(url.searchParams.get('slug'));

    const index = booksStore.findIndex((b) => b.slug === slug);

    if (index === -1) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    booksStore.splice(index, 1);
    await delay(50);

    return new HttpResponse(null, { status: 204 });
  }),
];

// Helper to reset the in-memory store (for test isolation)
export const resetBooksStore = (): void => {
  booksStore = [...initialBooks];
};
