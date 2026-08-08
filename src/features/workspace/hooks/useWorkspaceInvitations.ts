import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  workspaceApi,
  type InviteMemberPayload,
} from '../api/workspace.api';

export const invitationKeys = {
  all: (workspaceId: string) =>
    ['workspaces', workspaceId, 'invitations'] as const,
};

export function useWorkspaceInvitations(workspaceId: string | undefined) {
  return useQuery({
    queryKey: invitationKeys.all(workspaceId ?? ''),
    queryFn: () => workspaceApi.listInvitations(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMemberPayload) =>
      workspaceApi.invite(workspaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationKeys.all(workspaceId),
      });
    },
  });
}

export function useResendInvitation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      workspaceApi.resendInvitation(workspaceId, invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationKeys.all(workspaceId),
      });
    },
  });
}

export function useCancelInvitation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      workspaceApi.cancelInvitation(workspaceId, invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationKeys.all(workspaceId),
      });
    },
  });
}
