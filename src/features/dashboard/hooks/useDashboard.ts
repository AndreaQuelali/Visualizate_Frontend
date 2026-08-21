import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const dashboardKeys = {
  detail: (workspaceId: string) =>
    ['workspaces', workspaceId, 'dashboard'] as const,
};

export function useDashboard(workspaceId: string | null | undefined) {
  return useQuery({
    queryKey: dashboardKeys.detail(workspaceId ?? ''),
    queryFn: () => dashboardApi.get(workspaceId!),
    enabled: !!workspaceId,
    // Exports and reviews change on their own: keep the numbers fresh.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
