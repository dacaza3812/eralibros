import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, renderTest, screen } from '@/tests/utils/render';
import { BookFilters } from '@/app/dashboard/libros/BookFilters';

const categories = [
  { id: 'ficcion', name: 'Ficción' },
  { id: 'ensayo', name: 'Ensayo' },
];

describe('BookFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the search input and the category select', () => {
    renderTest(<BookFilters categories={categories} />);

    expect(screen.getByLabelText('Buscar título')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Todas' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ficción' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ensayo' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Limpiar filtros' }),
    ).not.toBeInTheDocument();
  });

  it('syncs the search query to the URL after a 300ms debounce', () => {
    const { router } = renderTest(<BookFilters categories={categories} />);
    vi.advanceTimersByTime(300);
    router.push.mockClear();

    fireEvent.change(screen.getByLabelText('Buscar título'), {
      target: { value: 'borges' },
    });

    expect(router.push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(router.push).toHaveBeenCalledWith('/dashboard/libros?search=borges');
  });

  it('syncs the category filter to the URL', () => {
    const { router } = renderTest(<BookFilters categories={categories} />);
    vi.advanceTimersByTime(300);
    router.push.mockClear();

    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'ensayo' },
    });
    vi.advanceTimersByTime(300);

    expect(router.push).toHaveBeenCalledWith(
      '/dashboard/libros?category=ensayo',
    );
  });

  it('clears the filters and syncs an empty query to the URL', () => {
    const { router } = renderTest(<BookFilters categories={categories} />, {
      router: { query: { search: 'borges', category: 'ensayo' } },
    });

    expect(screen.getByLabelText('Buscar título')).toHaveValue('borges');
    expect(screen.getByLabelText('Categoría')).toHaveValue('ensayo');

    vi.advanceTimersByTime(300);
    router.push.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    expect(screen.getByLabelText('Buscar título')).toHaveValue('');
    expect(screen.getByLabelText('Categoría')).toHaveValue('');

    vi.advanceTimersByTime(300);

    expect(router.push).toHaveBeenCalledWith('/dashboard/libros?');
  });

  it('syncs combined search and category filters to the URL', () => {
    const { router } = renderTest(<BookFilters categories={categories} />);
    vi.advanceTimersByTime(300);
    router.push.mockClear();

    fireEvent.change(screen.getByLabelText('Buscar título'), {
      target: { value: 'borges' },
    });
    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'ficcion' },
    });
    vi.advanceTimersByTime(300);

    expect(router.push).toHaveBeenCalledWith(
      '/dashboard/libros?search=borges&category=ficcion',
    );
  });
});
