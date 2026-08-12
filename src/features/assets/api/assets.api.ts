import api from '@/lib/axios';

export type AssetKind = 'IMAGE' | 'LOGO' | 'FONT';

export interface Asset {
  id: string;
  workspaceId: string;
  kind: AssetKind;
  name: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  url: string;
}

export const assetsApi = {
  list: async (workspaceId: string, kind?: AssetKind): Promise<Asset[]> => {
    const { data } = await api.get<Asset[]>(
      `/workspaces/${workspaceId}/assets`,
      { params: kind ? { kind } : undefined },
    );
    return data;
  },

  upload: async (
    workspaceId: string,
    file: File,
    opts: { kind?: AssetKind; name?: string } = {},
  ): Promise<Asset> => {
    const formData = new FormData();
    formData.append('file', file);
    if (opts.kind) formData.append('kind', opts.kind);
    if (opts.name) formData.append('name', opts.name);
    const { data } = await api.post<Asset>(
      `/workspaces/${workspaceId}/assets`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  remove: async (workspaceId: string, assetId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/assets/${assetId}`);
  },
};
