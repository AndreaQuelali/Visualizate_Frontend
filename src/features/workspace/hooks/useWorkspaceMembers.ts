import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  workspaceApi,
  type WorkspaceRole,
} from '../api/workspace.api';
import { workspaceKeys } from './useWorkspaces';

export const memberKeys = {
  all: (workspaceId: string) =>
    ['workspaces', workspaceId, 'members'] as const,
};

export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: memberKeys.all(workspaceId ?? ''),
    queryFn: () => workspaceApi.listMembers(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useChangeMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: WorkspaceRole;
    }) => workspaceApi.changeRole(workspaceId, userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: memberKeys.all(workspaceId),
      });
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      workspaceApi.removeMember(workspaceId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: memberKeys.all(workspaceId),
      });
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}
