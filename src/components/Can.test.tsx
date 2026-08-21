import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Can from './Can';
import type { WorkspaceRole } from '@/features/workspace/permissions';

const state: { role: WorkspaceRole | null; isLoading: boolean } = {
  role: 'ADMIN',
  isLoading: false,
};

vi.mock('@/features/workspace/hooks/useActiveWorkspace', () => ({
  useActiveWorkspace: () => ({ role: state.role, isLoading: state.isLoading }),
}));

describe('<Can>', () => {
  beforeEach(() => {
    state.role = 'ADMIN';
    state.isLoading = false;
  });

  it.each<[WorkspaceRole | null, WorkspaceRole | WorkspaceRole[], boolean]>([
    ['ADMIN', 'ADMIN', true],
    ['DESIGNER', 'ADMIN', false],
    ['DESIGNER', ['ADMIN', 'DESIGNER'], true],
    ['ORGANIZER', ['ADMIN', 'DESIGNER'], false],
    [null, ['ADMIN', 'DESIGNER', 'ORGANIZER'], false],
  ])('rol %s con permitido %j → visible %s', (role, allowed, visible) => {
    state.role = role;
    render(
      <Can role={allowed}>
        <button type="button">Acción</button>
      </Can>,
    );
    expect(!!screen.queryByRole('button', { name: 'Acción' })).toBe(visible);
  });

  it('muestra el fallback cuando el rol no alcanza', () => {
    state.role = 'ORGANIZER';
    render(
      <Can role="ADMIN" fallback={<p>Solo administradores</p>}>
        <button type="button">Acción</button>
      </Can>,
    );
    expect(screen.getByText('Solo administradores')).toBeInTheDocument();
  });

  it('no muestra nada ni el fallback mientras carga el rol', () => {
    state.isLoading = true;
    render(
      <Can role="ADMIN" fallback={<p>Sin permiso</p>}>
        <button type="button">Acción</button>
      </Can>,
    );
    expect(screen.queryByText('Sin permiso')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
