import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

vi.mock('@/store/workspaceStore', () => ({
  useWorkspaceStore: (
    selector?: (state: {
      activeWorkspaceId: string;
      setActiveWorkspace: () => void;
      clearActiveWorkspace: () => void;
    }) => unknown,
  ) => {
    const state = {
      activeWorkspaceId: 'ws-1',
      setActiveWorkspace: vi.fn(),
      clearActiveWorkspace: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock('@/features/workspace/hooks/useWorkspaces', () => ({
  useWorkspaces: () => ({
    data: [
      {
        id: 'ws-1',
        name: 'Equipo Marketing',
        description: null,
        logoUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'ADMIN',
        memberCount: 3,
      },
    ],
    isLoading: false,
  }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el nombre del workspace activo', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /equipo marketing/i }),
    ).toBeInTheDocument();
  });

  it('muestra enlace a espacios de trabajo', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('link', { name: /ver espacios/i }),
    ).toBeInTheDocument();
  });
});
