import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, renderTest, screen } from '@/tests/utils/render';
import { DeleteBookButton } from '@/app/dashboard/libros/DeleteBookButton';

const bookSlug = 'rayuela';
const bookTitle = 'Rayuela';

function renderDeleteButton() {
  const view = renderTest(
    <DeleteBookButton bookSlug={bookSlug} bookTitle={bookTitle} />,
  );
  const form = view.container.querySelector('form') as HTMLFormElement;
  const submitted: Event[] = [];
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitted.push(event);
  });
  return { ...view, form, submitted };
}

describe('DeleteBookButton', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a delete button for the book', () => {
    renderDeleteButton();

    expect(
      screen.getByRole('button', { name: 'Eliminar' }),
    ).toBeInTheDocument();
  });

  it('posts to the book-specific delete action', () => {
    const { form } = renderDeleteButton();

    expect(form).toHaveAttribute(
      'action',
      `/dashboard/libros/${bookSlug}/delete`,
    );
    expect(form).toHaveAttribute('method', 'POST');
  });

  it('shows a confirmation dialog with the book title on click', () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    renderDeleteButton();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(window.confirm).toHaveBeenCalledWith(
      `¿Estás seguro de eliminar "${bookTitle}"?`,
    );
  });

  it('keeps the book when the confirmation dialog is dismissed', () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    const { submitted } = renderDeleteButton();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(submitted).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: 'Eliminar' }),
    ).toBeInTheDocument();
  });

  it('submits the delete request when the dialog is confirmed', () => {
    vi.mocked(window.confirm).mockReturnValue(true);
    const { submitted } = renderDeleteButton();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(submitted).toHaveLength(1);
  });
});
