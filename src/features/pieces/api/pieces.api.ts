import api from '@/lib/axios';
import type { PieceOverrides } from '../overrides';

export type PieceStatus = 'DRAFT' | 'READY' | 'ARCHIVED';

export interface PieceSummary {
  id: string;
  workspaceId: string;
  templateId: string;
  templateVersionId: string;
  templateName: string;
  templateVersion: number;
  /** The template has a newer published version than this piece uses. */
  outdated: boolean;
  title: string;
  data: Record<string, string>;
  status: PieceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PieceDetail extends PieceSummary {
  /** TemplateDocument of the version this piece is pinned to. */
  document: unknown;
  /** Applied review recommendations, layered over the template document. */
  overrides: PieceOverrides;
}

export interface UpdatePiecePayload {
  title?: string;
  data?: Record<string, string>;
  status?: PieceStatus;
}

export interface UpgradeResult {
  dropped: string[];
  revertedToDraft: boolean;
}

const base = (workspaceId: string) => `/workspaces/${workspaceId}/pieces`;

export const piecesApi = {
  list: async (
    workspaceId: string,
    params: { status?: PieceStatus; templateId?: string; q?: string } = {},
  ): Promise<PieceSummary[]> => {
    const { data } = await api.get<PieceSummary[]>(base(workspaceId), {
      params,
    });
    return data;
  },

  get: async (workspaceId: string, id: string): Promise<PieceDetail> => {
    const { data } = await api.get<PieceDetail>(`${base(workspaceId)}/${id}`);
    return data;
  },

  create: async (
    workspaceId: string,
    payload: { templateId: string; title: string },
  ): Promise<{ id: string }> => {
    const { data } = await api.post<{ id: string }>(base(workspaceId), payload);
    return data;
  },

  update: async (
    workspaceId: string,
    id: string,
    payload: UpdatePiecePayload,
  ): Promise<{ id: string }> => {
    const { data } = await api.patch<{ id: string }>(
      `${base(workspaceId)}/${id}`,
      payload,
    );
    return data;
  },

  upgrade: async (workspaceId: string, id: string): Promise<UpgradeResult> => {
    const { data } = await api.post<UpgradeResult>(
      `${base(workspaceId)}/${id}/upgrade`,
    );
    return data;
  },

  remove: async (workspaceId: string, id: string): Promise<void> => {
    await api.delete(`${base(workspaceId)}/${id}`);
  },
};
