import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandApi, type UpdateBrandPayload } from '../api/brand.api';

export const brandKeys = {
  detail: (workspaceId: string) =>
    ['workspaces', workspaceId, 'brand'] as const,
};

export function useBrand(workspaceId: string | null | undefined) {
  return useQuery({
    queryKey: brandKeys.detail(workspaceId ?? ''),
    queryFn: () => brandApi.get(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useUpdateBrand(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBrandPayload) =>
      brandApi.update(workspaceId, payload),
    onSuccess: (brand) => {
      queryClient.setQueryData(brandKeys.detail(workspaceId), brand);
    },
  });
}
