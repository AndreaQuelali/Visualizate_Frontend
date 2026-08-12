import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TemplatesPage from './TemplatesPage';

const state = vi.hoisted(() => ({
  role: 'ORGANIZER' as 'ADMIN' | 'DESIGNER' | 'ORGANIZER',
  templates: [] as Array<Record<string, unknown>>,
}));

vi.mock('@/features/workspace/hooks/useActiveWorkspace', () => ({
  useActiveWorkspace: () => ({
    workspaceId: 'ws-1',
    workspace: { id: 'ws-1' },
    role: state.role,
    isLoading: false,
    isAdmin: state.role === 'ADMIN',
    canEditTemplates: state.role !== 'ORGANIZER',
  }),
}));

vi.mock('../hooks/useTemplates', () => ({
  useTemplates: () => ({
    data: state.templates,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpdateTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDuplicateTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <TemplatesPage />
    </MemoryRouter>,
  );

describe('TemplatesPage', () => {
  beforeEach(() => {
    state.role = 'ORGANIZER';
    state.templates = [];
  });

  it('shows the empty state without create actions for an ORGANIZER', () => {
    renderPage();
    expect(screen.getByText('Aún no hay plantillas')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /nueva plantilla/i }),
    ).not.toBeInTheDocument();
  });

  it('offers creating a template to a DESIGNER', () => {
    state.role = 'DESIGNER';
    renderPage();
    expect(
      screen.getAllByRole('button', { name: /nueva plantilla/i }).length,
    ).toBeGreaterThan(0);
  });

  it('lists templates with their status', () => {
    state.templates = [
      {
        id: 't1',
        name: 'Flyer de evento',
        description: null,
        status: 'PUBLISHED',
        latestVersion: 2,
        hasUnpublishedChanges: true,
      },
    ];
    renderPage();
    expect(screen.getByText('Flyer de evento')).toBeInTheDocument();
    expect(screen.getByText('Publicada')).toBeInTheDocument();
    expect(screen.getByText('Cambios sin publicar')).toBeInTheDocument();
  });
});
