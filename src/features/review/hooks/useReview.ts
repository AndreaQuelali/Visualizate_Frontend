import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pieceKeys } from '@/features/pieces/hooks/usePieces';
import { reviewApi } from '../api/review.api';

export const POLL_MS = 1500;

export const reviewKeys = {
  forPiece: (workspaceId: string, pieceId: string) =>
    ['workspaces', workspaceId, 'pieces', pieceId, 'reviews'] as const,
  detail: (workspaceId: string, reviewId: string) =>
    ['workspaces', workspaceId, 'reviews', reviewId] as const,
  settings: (workspaceId: string) =>
    ['workspaces', workspaceId, 'review-settings'] as const,
};

export function useReviews(workspaceId: string, pieceId: string) {
  return useQuery({
    queryKey: reviewKeys.forPiece(workspaceId, pieceId),
    queryFn: () => reviewApi.list(workspaceId, pieceId),
  });
}

/** One review with its items; polls only while it is queued or running. */
export function useReview(workspaceId: string, reviewId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.detail(workspaceId, reviewId ?? ''),
    queryFn: () => reviewApi.get(workspaceId, reviewId!),
    enabled: !!reviewId,
    refetchInterval: (query) =>
      query.state.data?.status === 'QUEUED' ||
      query.state.data?.status === 'RUNNING'
        ? POLL_MS
        : false,
  });
}

export function useRequestReview(workspaceId: string, pieceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reviewApi.request(workspaceId, pieceId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: reviewKeys.forPiece(workspaceId, pieceId),
      }),
  });
}

/**
 * apply / dismiss / revert / applyMany. When the piece changes, the piece
 * queries are refetched *before* resolving so the editor can reload safely.
 */
export function useReviewActions(workspaceId: string, pieceId: string) {
  const queryClient = useQueryClient();

  const refresh = async (touchesPiece: boolean) => {
    await queryClient.invalidateQueries({
      queryKey: ['workspaces', workspaceId, 'reviews'],
    });
    await queryClient.invalidateQueries({
      queryKey: reviewKeys.forPiece(workspaceId, pieceId),
    });
    if (touchesPiece) {
      await queryClient.invalidateQueries({
        queryKey: pieceKeys.all(workspaceId),
      });
    }
  };

  const apply = useMutation({
    mutationFn: (itemId: string) => reviewApi.apply(workspaceId, itemId),
    onSettled: () => refresh(true),
  });
  const revert = useMutation({
    mutationFn: (itemId: string) => reviewApi.revert(workspaceId, itemId),
    onSettled: () => refresh(true),
  });
  const dismiss = useMutation({
    mutationFn: (itemId: string) => reviewApi.dismiss(workspaceId, itemId),
    onSettled: () => refresh(false),
  });
  const applyMany = useMutation({
    mutationFn: (args: { reviewId: string; itemIds: string[] }) =>
      reviewApi.applyMany(workspaceId, args.reviewId, args.itemIds),
    onSettled: () => refresh(true),
  });

  return { apply, revert, dismiss, applyMany };
}

export function useReviewSettings(workspaceId: string) {
  return useQuery({
    queryKey: reviewKeys.settings(workspaceId),
    queryFn: () => reviewApi.getSettings(workspaceId),
  });
}

export function useUpdateReviewSettings(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aiEnabled: boolean) =>
      reviewApi.updateSettings(workspaceId, aiEnabled),
    onSuccess: (settings) =>
      queryClient.setQueryData(reviewKeys.settings(workspaceId), settings),
  });
}
