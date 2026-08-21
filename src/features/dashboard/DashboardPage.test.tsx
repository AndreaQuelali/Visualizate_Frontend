import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import type { Dashboard } from './api/dashboard.api';
import type { WorkspaceRole } from '@/features/workspace/permissions';

const refetch = vi.fn();
const state: {
  role: WorkspaceRole;
  query: {
    data: Dashboard | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };
} = {
  role: 'ADMIN',
  query: { data: undefined, isLoading: false, isError: false, error: null },
};

vi.mock('@/features/workspace/hooks/useActiveWorkspace', () => ({
  useActiveWorkspace: () => ({
    workspaceId: 'ws-1',
    workspace: { id: 'ws-1', name: 'Equipo Marketing', role: state.role },
    role: state.role,
    isLoading: false,
    isAdmin: state.role === 'ADMIN',
    canEditTemplates: state.role !== 'ORGANIZER',
  }),
}));

vi.mock('./hooks/useDashboard', () => ({
  useDashboard: () => ({ ...state.query, refetch }),
}));

vi.mock('@/features/render/components/ExportMenu', () => ({
  default: ({ pieceId }: { pieceId: string }) => (
    <button type="button">Exportar {pieceId}</button>
  ),
}));

const usage = {
  period: { start: '2026-11-01', end: '2026-12-01' },
  storageBytes: { used: 5 * 1024 * 1024, limit: 200 * 1024 * 1024 },
  activePieces: { used: 8, limit: 10 },
  rendersPerMonth: { used: 10, limit: 10 },
  reviewsPerMonth: { used: 1, limit: 100 },
  piecesCreatedThisMonth: 3,
};

function dashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  const now = new Date().toISOString();
  return {
    generatedAt: now,
    onboarding: { brand: true, template: true, piece: true },
    recentPieces: [
      {
        id: 'p1',
        title: 'Flyer concierto',
        status: 'READY',
        templateName: 'Flyer',
        updatedAt: now,
        thumbnailUrl: 'https://img/p1.png',
      },
      {
        id: 'p2',
        title: 'Borrador sin render',
        status: 'DRAFT',
        templateName: 'Flyer',
        updatedAt: now,
        thumbnailUrl: null,
      },
    ],
    topTemplates: [{ id: 't1', name: 'Flyer', piecesCount: 2 }],
    recentRenders: [
      {
        id: 'r1',
        pieceId: 'p1',
        pieceTitle: 'Flyer concierto',
        format: 'PNG',
        status: 'RUNNING',
        errorMessage: null,
        createdAt: now,
        finishedAt: null,
      },
      {
        id: 'r2',
        pieceId: 'p1',
        pieceTitle: 'Flyer concierto',
        format: 'PDF',
        status: 'SUCCEEDED',
        errorMessage: null,
        createdAt: now,
        finishedAt: now,
      },
      {
        id: 'r3',
        pieceId: 'p2',
        pieceTitle: 'Borrador sin render',
        format: 'PNG',
        status: 'FAILED',
        errorMessage: 'Navegador no disponible',
        createdAt: now,
        finishedAt: now,
      },
    ],
    pendingReviews: [
      {
        reviewId: 'rv1',
        pieceId: 'p1',
        pieceTitle: 'Flyer concierto',
        pendingItems: 2,
        createdAt: now,
      },
    ],
    usage,
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.role = 'ADMIN';
    state.query = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    };
  });

  it('muestra el nombre del workspace activo', () => {
    state.query.data = dashboard();
    renderPage();
    expect(
      screen.getByRole('heading', { name: /equipo marketing/i }),
    ).toBeInTheDocument();
  });

  it('muestra skeletons mientras carga', () => {
    state.query = { ...state.query, isLoading: true };
    renderPage();
    expect(
      screen.getAllByRole('status', { name: /cargando/i }).length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('un workspace nuevo ve los tres pasos guiados', () => {
    state.query.data = dashboard({
      onboarding: { brand: false, template: false, piece: false },
      recentPieces: [],
      topTemplates: [],
      recentRenders: [],
      pendingReviews: [],
    });
    renderPage();
    const guide = screen.getByRole('region', { name: /primeros pasos/i });
    expect(within(guide).getAllByRole('listitem')).toHaveLength(3);
    expect(
      within(guide).getByRole('link', { name: /ir a marca/i }),
    ).toHaveAttribute('href', '/brand');
    expect(
      within(guide).getByRole('link', { name: /nueva pieza/i }),
    ).toHaveAttribute('href', '/pieces/new');
    expect(
      screen.queryByRole('region', { name: /piezas recientes/i }),
    ).not.toBeInTheDocument();
  });

  it('marca como completados los pasos ya hechos', () => {
    state.query.data = dashboard({
      onboarding: { brand: true, template: false, piece: false },
    });
    renderPage();
    const guide = screen.getByRole('region', { name: /primeros pasos/i });
    expect(within(guide).getByText('Completado')).toBeInTheDocument();
    expect(
      within(guide).getByRole('link', { name: /nueva plantilla/i }),
    ).toBeInTheDocument();
  });

  it('a un ORGANIZER le pide ayuda en los pasos que no puede hacer', () => {
    state.role = 'ORGANIZER';
    state.query.data = dashboard({
      onboarding: { brand: false, template: false, piece: false },
    });
    renderPage();
    const guide = screen.getByRole('region', { name: /primeros pasos/i });
    expect(
      within(guide).queryByRole('link', { name: /ir a marca/i }),
    ).not.toBeInTheDocument();
    expect(
      within(guide).getByText(/pide a un administrador/i),
    ).toBeInTheDocument();
  });

  it('muestra piezas recientes con estado, miniatura y exportar', () => {
    state.query.data = dashboard();
    renderPage();
    const block = screen.getByRole('region', { name: /piezas recientes/i });
    expect(
      within(block).getByRole('img', {
        name: /vista previa de flyer concierto/i,
      }),
    ).toHaveAttribute('src', 'https://img/p1.png');
    expect(within(block).getByText('Lista')).toBeInTheDocument();
    expect(within(block).getByText('Borrador')).toBeInTheDocument();
    expect(
      within(block).getByRole('button', { name: 'Exportar p1' }),
    ).toBeInTheDocument();
  });

  it('muestra el estado de las exportaciones recientes', () => {
    state.query.data = dashboard();
    renderPage();
    const block = screen.getByRole('region', {
      name: /exportaciones recientes/i,
    });
    expect(within(block).getByText('En curso')).toBeInTheDocument();
    expect(within(block).getByText('Listo')).toBeInTheDocument();
    expect(within(block).getByText('Fallido')).toBeInTheDocument();
    expect(
      within(block).getByText(/navegador no disponible/i),
    ).toBeInTheDocument();
  });

  it('muestra revisiones pendientes y plantillas más usadas', () => {
    state.query.data = dashboard();
    renderPage();
    expect(
      within(
        screen.getByRole('region', { name: /revisiones pendientes/i }),
      ).getByText('2 por decidir'),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('region', { name: /plantillas más usadas/i }),
      ).getByText('2 piezas'),
    ).toBeInTheDocument();
  });

  it('muestra el consumo frente al límite y avisa cuando se agota', () => {
    state.query.data = dashboard();
    renderPage();
    const block = screen.getByRole('region', { name: /uso del periodo/i });
    expect(
      within(block).getByRole('progressbar', { name: 'Piezas activas' }),
    ).toHaveAttribute('aria-valuenow', '80');
    expect(
      within(block).getByRole('progressbar', { name: 'Exportaciones del mes' }),
    ).toHaveAttribute('aria-valuenow', '100');
    expect(
      within(block).getByText(/alcanzaste el límite/i),
    ).toBeInTheDocument();
    expect(within(block).getByText(/5\.0 MB de 200\.0 MB/)).toBeInTheDocument();
  });

  it('un bloque con error no rompe el resto y permite reintentar', async () => {
    state.query.data = dashboard({
      recentRenders: { error: 'No se pudo cargar este bloque' },
    });
    renderPage();
    const failing = screen.getByRole('region', {
      name: /exportaciones recientes/i,
    });
    expect(within(failing).getByRole('alert')).toHaveTextContent(
      /no se pudo cargar este bloque/i,
    );
    expect(
      screen.getByRole('region', { name: /piezas recientes/i }),
    ).toBeInTheDocument();

    await userEvent.click(
      within(failing).getByRole('button', { name: /reintentar/i }),
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra mensajes vacíos por bloque', () => {
    state.query.data = dashboard({
      recentRenders: [],
      pendingReviews: [],
      topTemplates: [],
    });
    renderPage();
    expect(screen.getByText(/aún no has exportado/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no hay recomendaciones pendientes/i),
    ).toBeInTheDocument();
  });

  it('muestra un error general si falla la carga completa', async () => {
    state.query = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { data: { message: 'Servicio caído' } } },
    };
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Servicio caído');
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(refetch).toHaveBeenCalled();
  });

  describe('accesos rápidos según el rol', () => {
    it.each<[WorkspaceRole, boolean]>([
      ['ADMIN', true],
      ['DESIGNER', true],
      ['ORGANIZER', false],
    ])('%s ve plantilla y asset: %s', (role, visible) => {
      state.role = role;
      state.query.data = dashboard();
      renderPage();
      const nav = screen.getByRole('navigation', { name: /accesos rápidos/i });
      expect(
        within(nav).getByRole('link', { name: /nueva pieza/i }),
      ).toBeInTheDocument();
      expect(
        !!within(nav).queryByRole('link', { name: /nueva plantilla/i }),
      ).toBe(visible);
      expect(!!within(nav).queryByRole('link', { name: /subir asset/i })).toBe(
        visible,
      );
      expect(
        !!within(nav).queryByRole('link', { name: /configuración/i }),
      ).toBe(role === 'ADMIN');
    });
  });
});
