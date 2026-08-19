import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { renderApi, type RequestRenderPayload } from '../api/render.api';

export const POLL_MS = 1500;

export const renderKeys = {
  forPiece: (workspaceId: string, pieceId: string) =>
    ['workspaces', workspaceId, 'pieces', pieceId, 'render-jobs'] as const,
};

/** Export history of a piece; polls only while a job is queued or running. */
export function useRenderJobs(
  workspaceId: string | null | undefined,
  pieceId: string | undefined,
) {
  return useQuery({
    queryKey: renderKeys.forPiece(workspaceId ?? '', pieceId ?? ''),
    queryFn: () => renderApi.list(workspaceId!, pieceId!),
    enabled: !!workspaceId && !!pieceId,
    refetchInterval: (query) =>
      query.state.data?.some(
        (j) => j.status === 'QUEUED' || j.status === 'RUNNING',
      )
        ? POLL_MS
        : false,
  });
}

export function useRequestRender(workspaceId: string, pieceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestRenderPayload) =>
      renderApi.request(workspaceId, pieceId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: renderKeys.forPiece(workspaceId, pieceId),
      }),
  });
}

export function useCancelRender(workspaceId: string, pieceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => renderApi.cancel(workspaceId, jobId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: renderKeys.forPiece(workspaceId, pieceId),
      }),
  });
}

/** Asks for a short-lived signed URL and triggers the browser download. */
export async function downloadRender(workspaceId: string, jobId: string) {
  const info = await renderApi.download(workspaceId, jobId);
  const link = document.createElement('a');
  link.href = info.url;
  link.download = info.filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
