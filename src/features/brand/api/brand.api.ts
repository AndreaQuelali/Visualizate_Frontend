import api from '@/lib/axios';

export type ColorRole = 'PRIMARY' | 'SECONDARY' | 'ACCENT' | 'NEUTRAL';

export interface BrandColor {
  id?: string;
  name: string;
  hex: string;
  role: ColorRole;
}

export interface BrandFont {
  id?: string;
  family: string;
  weights: number[];
  assetId?: string;
}

export interface Brand {
  colors: BrandColor[];
  fonts: BrandFont[];
  logoAssetId: string | null;
  logoUrl: string | null;
  updatedAt: string | null;
}

export interface UpdateBrandPayload {
  colors: BrandColor[];
  fonts: BrandFont[];
  logoAssetId: string | null;
}

export const brandApi = {
  get: async (workspaceId: string): Promise<Brand> => {
    const { data } = await api.get<Brand>(`/workspaces/${workspaceId}/brand`);
    return data;
  },

  update: async (
    workspaceId: string,
    payload: UpdateBrandPayload,
  ): Promise<Brand> => {
    const { data } = await api.put<Brand>(
      `/workspaces/${workspaceId}/brand`,
      payload,
    );
    return data;
  },
};
