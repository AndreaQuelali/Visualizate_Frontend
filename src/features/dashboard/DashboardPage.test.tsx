import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockLogout = vi.fn();
const mockState = {
  user: {
    fullName: 'Carlos López',
    email: 'carlos@example.com',
    id: '1',
    isVerified: true,
  },
  logout: mockLogout,
};

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector?: (state: typeof mockState) => unknown) =>
    selector ? selector(mockState) : mockState,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el texto "SOY DASHBOARD"', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /soy dashboard/i }),
    ).toBeInTheDocument();
  });

  it('muestra el botón de cerrar sesión', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('button', { name: /cerrar sesión/i }),
    ).toBeInTheDocument();
  });

  it('al hacer clic en cerrar sesión ejecuta logout y navega a /login', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    const btn = screen.getByRole('button', { name: /cerrar sesión/i });
    fireEvent.click(btn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
