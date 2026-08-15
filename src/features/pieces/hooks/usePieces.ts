import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  piecesApi,
  type PieceStatus,
  type UpdatePiecePayload,
} from '../api/pieces.api';

export const pieceKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'pieces'] as const,
  list: (workspaceId: string, status?: PieceStatus, q?: string) =>
    [
      'workspaces',
      workspaceId,
      'pieces',
      'list',
      status ?? '',
      q ?? '',
    ] as const,
  detail: (workspaceId: string, id: string) =>
    ['workspaces', workspaceId, 'pieces', 'detail', id] as const,
};

export function usePieces(
  workspaceId: string | null | undefined,
  filters: { status?: PieceStatus; q?: string } = {},
) {
  return useQuery({
    queryKey: pieceKeys.list(workspaceId ?? '', filters.status, filters.q),
    queryFn: () => piecesApi.list(workspaceId!, filters),
    enabled: !!workspaceId,
  });
}

export function usePiece(
  workspaceId: string | null | undefined,
  id: string | undefined,
) {
  return useQuery({
    queryKey: pieceKeys.detail(workspaceId ?? '', id ?? ''),
    queryFn: () => piecesApi.get(workspaceId!, id!),
    enabled: !!workspaceId && !!id,
  });
}

function useInvalidate(workspaceId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: pieceKeys.all(workspaceId) });
}

export function useCreatePiece(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (payload: { templateId: string; title: string }) =>
      piecesApi.create(workspaceId, payload),
    onSuccess: () => void invalidate(),
  });
}

export function useUpdatePiece(workspaceId: string, id: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (payload: UpdatePiecePayload) =>
      piecesApi.update(workspaceId, id, payload),
    onSuccess: () => void invalidate(),
  });
}

export function useUpgradePiece(workspaceId: string, id: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: () => piecesApi.upgrade(workspaceId, id),
    onSuccess: () => void invalidate(),
  });
}

export function useDeletePiece(workspaceId: string) {
  const invalidate = useInvalidate(workspaceId);
  return useMutation({
    mutationFn: (id: string) => piecesApi.remove(workspaceId, id),
    onSuccess: () => void invalidate(),
  });
}
