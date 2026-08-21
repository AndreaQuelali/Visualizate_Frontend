export type WorkspaceRole = 'ADMIN' | 'DESIGNER' | 'ORGANIZER';

/**
 * Role groups mirroring the permission matrix of the API. They only decide
 * what the UI shows: the API stays the source of truth and rejects with 403.
 */
export const ADMIN_ONLY: WorkspaceRole[] = ['ADMIN'];
export const EDITORS: WorkspaceRole[] = ['ADMIN', 'DESIGNER'];
export const ANY_MEMBER: WorkspaceRole[] = ['ADMIN', 'DESIGNER', 'ORGANIZER'];

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  ADMIN: 'Administrador',
  DESIGNER: 'Diseñador',
  ORGANIZER: 'Organizador',
};

export function hasRole(
  role: WorkspaceRole | null | undefined,
  allowed: WorkspaceRole | readonly WorkspaceRole[],
): boolean {
  if (!role) return false;
  return (Array.isArray(allowed) ? allowed : [allowed]).includes(role);
}
