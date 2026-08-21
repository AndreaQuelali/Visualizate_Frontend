import { hasRole, type WorkspaceRole } from '../permissions';
import { useActiveWorkspace } from './useActiveWorkspace';

/**
 * Role of the current user in the active workspace, plus a helper to ask
 * whether they hold one of the given roles. UI only: the API enforces access.
 */
export function useWorkspaceRole() {
  const { role, isLoading } = useActiveWorkspace();
  return {
    role: role as WorkspaceRole | null,
    isLoading,
    hasRole: (allowed: WorkspaceRole | readonly WorkspaceRole[]) =>
      hasRole(role, allowed),
  };
}
