import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  templatesApi,
  type CreateTemplatePayload,
  type TemplateStatus,
  type UpdateTemplatePayload,
} from '../api/templates.api';

export const templateKeys = {
  all: (workspaceId: string) =>
    ['workspaces', workspaceId, 'templates'] as const,
  list: (workspaceId: string, status?: TemplateStatus, q?: string) =>
    [
      'workspaces',
      workspaceId,
      'templates',
      'list',
      status ?? '',
      q ?? '',
    ] as const,
};

export function useTemplates(
  workspaceId: string | null | undefined,
  filters: { status?: TemplateStatus; q?: string } = {},
) {
  return useQuery({
    queryKey: templateKeys.list(workspaceId ?? '', filters.status, filters.q),
    queryFn: () => templatesApi.list(workspaceId!, filters),
    enabled: !!workspaceId,
  });
}

export function useTemplate(
  workspaceId: string | null | undefined,
  id: string | undefined,
) {
  return useQuery({
    queryKey: [...templateKeys.all(workspaceId ?? ''), 'detail', id ?? ''],
    queryFn: () => templatesApi.get(workspaceId!, id!),
    enabled: !!workspaceId && !!id,
    // The editor owns the document while open; do not refetch under it.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useSaveDraft(workspaceId: string, id: string) {
  return useMutation({
    mutationFn: (document: unknown) =>
      templatesApi.saveDraft(workspaceId, id, document),
  });
}

export function usePublishTemplate(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templatesApi.publish(workspaceId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templateKeys.all(workspaceId),
      });
    },
  });
}

function useInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: templateKeys.all(workspaceId) });
}

export function useCreateTemplate(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      templatesApi.create(workspaceId, payload),
    onSuccess: () => void invalidate(),
  });
}

export function useUpdateTemplate(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateTemplatePayload & { id: string }) =>
      templatesApi.update(workspaceId, id, payload),
    onSuccess: () => void invalidate(),
  });
}

export function useDuplicateTemplate(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => templatesApi.duplicate(workspaceId, id),
    onSuccess: () => void invalidate(),
  });
}

export function useDeleteTemplate(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => templatesApi.remove(workspaceId, id),
    onSuccess: () => void invalidate(),
  });
}
