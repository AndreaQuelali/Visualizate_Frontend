import { useWorkspaceStore } from '@/store/workspaceStore';
import { useWorkspaces } from './useWorkspaces';

/**
 * Resolves the active workspace and what the current user may do in it.
 * The API remains the source of truth; this only drives the UI.
 */
export function useActiveWorkspace() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const workspace = workspaces.find((w) => w.id === workspaceId) ?? null;
  const role = workspace?.role ?? null;

  return {
    workspaceId,
    workspace,
    role,
    isLoading,
    isAdmin: role === 'ADMIN',
    canEditTemplates: role === 'ADMIN' || role === 'DESIGNER',
  };
}
