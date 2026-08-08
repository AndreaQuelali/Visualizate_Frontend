import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  workspaceApi,
  type CreateWorkspacePayload,
  type UpdateWorkspacePayload,
} from '../api/workspace.api';

export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: string) => ['workspaces', id] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: workspaceApi.list,
  });
}

export function useWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.detail(id ?? ''),
    queryFn: () => workspaceApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) =>
      workspaceApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useUpdateWorkspace(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkspacePayload) =>
      workspaceApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(id),
      });
    },
  });
}

export function useUploadWorkspaceLogo(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => workspaceApi.uploadLogo(id, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(id),
      });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspaceApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useLeaveWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspaceApi.leave(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => workspaceApi.acceptInvitation(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}
