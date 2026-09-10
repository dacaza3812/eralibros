import { describe, it, expect } from 'vitest';
import { fireEvent, renderTest, screen } from '@/tests/utils/render';
import { OrderFilters } from '@/app/dashboard/pedidos/OrderFilters';

const statusOptions = [
  'Todos los estados',
  'Pendiente',
  'Confirmado',
  'Enviado',
  'Entregado',
  'Cancelado',
];

describe('OrderFilters', () => {
  it('renders the search input and the status select with all options', () => {
    renderTest(<OrderFilters />);

    expect(
      screen.getByPlaceholderText('Buscar por nombre, email o teléfono...'),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    for (const option of statusOptions) {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    }
  });

  it('syncs the search query to the URL immediately', () => {
    const { router } = renderTest(<OrderFilters />);

    fireEvent.change(
      screen.getByPlaceholderText('Buscar por nombre, email o teléfono...'),
      { target: { value: 'juan' } },
    );

    expect(router.push).toHaveBeenCalledWith(
      '/dashboard/pedidos?search=juan',
      { scroll: false },
    );
  });

  it('syncs the status filter to the URL', () => {
    const { router } = renderTest(<OrderFilters />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'pendiente' },
    });

    expect(router.push).toHaveBeenCalledWith(
      '/dashboard/pedidos?status=pendiente',
      { scroll: false },
    );
  });

  it('removes the search param from the URL when the input is cleared', () => {
    const { router } = renderTest(<OrderFilters />, {
      router: { query: { search: 'juan' } },
    });

    expect(
      screen.getByPlaceholderText('Buscar por nombre, email o teléfono...'),
    ).toHaveValue('juan');

    fireEvent.change(
      screen.getByPlaceholderText('Buscar por nombre, email o teléfono...'),
      { target: { value: '' } },
    );

    expect(router.push).toHaveBeenCalledWith('/dashboard/pedidos?', {
      scroll: false,
    });
  });

  it('preserves the active status filter when searching', () => {
    const { router } = renderTest(<OrderFilters />, {
      router: { query: { status: 'pendiente' } },
    });

    expect(screen.getByRole('combobox')).toHaveValue('pendiente');

    fireEvent.change(
      screen.getByPlaceholderText('Buscar por nombre, email o teléfono...'),
      { target: { value: 'juan' } },
    );

    expect(router.push).toHaveBeenCalledWith(
      '/dashboard/pedidos?status=pendiente&search=juan',
      { scroll: false },
    );
  });
});
