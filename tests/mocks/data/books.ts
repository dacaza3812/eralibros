export interface MockBook {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author: string | null;
  year: number | null;
  isbn: string | null;
  price: number | null;
  category_id: string | null;
  stock_type: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const initialBooks: MockBook[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'cien-anos-de-soledad',
    title: 'Cien años de soledad',
    description: 'A landmark novel of magical realism.',
    author: 'Gabriel García Márquez',
    year: 1967,
    isbn: '9780307474728',
    price: 24.99,
    category_id: 'cat-ficcion',
    stock_type: 'impreso_listo',
    stock_quantity: 12,
    is_active: true,
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'la-sombra-del-viento',
    title: 'La sombra del viento',
    description: 'A mystery set in post-war Barcelona.',
    author: 'Carlos Ruiz Zafón',
    year: 2001,
    isbn: '9780143034902',
    price: 19.99,
    category_id: 'cat-ficcion',
    stock_type: 'impreso_listo',
    stock_quantity: 5,
    is_active: true,
    created_at: '2026-02-15T10:00:00.000Z',
    updated_at: '2026-02-15T10:00:00.000Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    slug: 'libro-inactivo-demo',
    title: 'Libro inactivo demo',
    description: null,
    author: null,
    year: null,
    isbn: null,
    price: null,
    category_id: null,
    stock_type: 'impreso_listo',
    stock_quantity: 0,
    is_active: false,
    created_at: '2026-03-20T10:00:00.000Z',
    updated_at: '2026-03-20T10:00:00.000Z',
  },
];
