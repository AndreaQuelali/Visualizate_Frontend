import type { ReactNode } from 'react';
import { useWorkspaceRole } from '@/features/workspace/hooks/useWorkspaceRole';
import type { WorkspaceRole } from '@/features/workspace/permissions';

interface CanProps {
  /** Role or roles allowed to see the children. */
  role: WorkspaceRole | readonly WorkspaceRole[];
  /** Rendered instead of the children when the role is not allowed. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Hides UI the current role cannot use. It is a convenience, never a barrier:
 * the API rejects the same actions with 403.
 */
export default function Can({ role, fallback = null, children }: CanProps) {
  const { hasRole, isLoading } = useWorkspaceRole();
  if (isLoading) return null;
  return <>{hasRole(role) ? children : fallback}</>;
}
