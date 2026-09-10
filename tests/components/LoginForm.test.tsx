import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { renderTest, screen, waitFor } from '@/tests/utils/render';

const { mockSignInWithPassword } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { signInWithPassword: mockSignInWithPassword },
  })),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import LoginForm from '@/app/login/LoginForm';

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs with a submit button', () => {
    renderTest(<LoginForm />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument();
  });

  it('redirects to the dashboard after a successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: {} },
      error: null,
    });
    const { router } = renderTest(<LoginForm />);

    await fillAndSubmit('admin@eralibros.com', 'secret123');

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'admin@eralibros.com',
      password: 'secret123',
    });
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/dashboard'));
    expect(router.refresh).toHaveBeenCalled();
  });

  it('shows an error message for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });
    const { router } = renderTest(<LoginForm />);

    await fillAndSubmit('admin@eralibros.com', 'wrong-password');

    expect(
      await screen.findByText('Invalid login credentials'),
    ).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it('redirects to the redirectTo query param after login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: {} },
      error: null,
    });
    const { router } = renderTest(<LoginForm />, {
      router: { query: { redirectTo: '/dashboard/libros' } },
    });

    await fillAndSubmit('admin@eralibros.com', 'secret123');

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith('/dashboard/libros'),
    );
  });

  it('disables the submit button while login is in progress', async () => {
    let resolveLogin!: (value: unknown) => void;
    mockSignInWithPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    const user = userEvent.setup();
    renderTest(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@eralibros.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(
      await screen.findByRole('button', { name: 'Iniciando sesión...' }),
    ).toBeDisabled();

    resolveLogin({ data: { session: {} }, error: null });
  });
});
