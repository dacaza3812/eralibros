export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const initialCategories: MockCategory[] = [
  {
    id: 'cat-ficcion',
    name: 'Ficcion',
    slug: 'ficcion',
    description: 'Novels and short stories.',
    order_index: 0,
    is_active: true,
    created_at: '2026-01-05T10:00:00.000Z',
    updated_at: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'cat-ensayo',
    name: 'Ensayo',
    slug: 'ensayo',
    description: 'Essays and non-fiction.',
    order_index: 1,
    is_active: true,
    created_at: '2026-01-05T10:00:00.000Z',
    updated_at: '2026-01-05T10:00:00.000Z',
  },
];
