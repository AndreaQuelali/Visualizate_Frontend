import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsApi, type AssetKind } from '../api/assets.api';

export const assetKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'assets'] as const,
};

export function useAssets(workspaceId: string | null | undefined) {
  return useQuery({
    queryKey: assetKeys.all(workspaceId ?? ''),
    queryFn: () => assetsApi.list(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useUploadAsset(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      kind,
      name,
    }: {
      file: File;
      kind?: AssetKind;
      name?: string;
    }) => assetsApi.upload(workspaceId, file, { kind, name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assetKeys.all(workspaceId),
      });
    },
  });
}

export function useDeleteAsset(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => assetsApi.remove(workspaceId, assetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assetKeys.all(workspaceId),
      });
    },
  });
}
