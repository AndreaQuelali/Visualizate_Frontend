import api from '@/lib/axios';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface TemplateSummary {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: TemplateStatus;
  currentVersionId: string | null;
  latestVersion: number | null;
  hasUnpublishedChanges: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersionInfo {
  id: string;
  version: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface TemplateDetail extends Omit<TemplateSummary, 'latestVersion'> {
  versions: TemplateVersionInfo[];
  latestVersionId: string | null;
  /** Latest TemplateDocument (draft if there is one, otherwise published). */
  document: unknown;
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
}

export interface UpdateTemplatePayload {
  name?: string;
  description?: string;
  archived?: boolean;
}

const base = (workspaceId: string) => `/workspaces/${workspaceId}/templates`;

export const templatesApi = {
  list: async (
    workspaceId: string,
    params: { status?: TemplateStatus; q?: string } = {},
  ): Promise<TemplateSummary[]> => {
    const { data } = await api.get<TemplateSummary[]>(base(workspaceId), {
      params,
    });
    return data;
  },

  get: async (workspaceId: string, id: string): Promise<TemplateDetail> => {
    const { data } = await api.get<TemplateDetail>(
      `${base(workspaceId)}/${id}`,
    );
    return data;
  },

  create: async (
    workspaceId: string,
    payload: CreateTemplatePayload,
  ): Promise<TemplateDetail> => {
    const { data } = await api.post<TemplateDetail>(base(workspaceId), payload);
    return data;
  },

  update: async (
    workspaceId: string,
    id: string,
    payload: UpdateTemplatePayload,
  ): Promise<TemplateDetail> => {
    const { data } = await api.patch<TemplateDetail>(
      `${base(workspaceId)}/${id}`,
      payload,
    );
    return data;
  },

  duplicate: async (
    workspaceId: string,
    id: string,
  ): Promise<TemplateDetail> => {
    const { data } = await api.post<TemplateDetail>(
      `${base(workspaceId)}/${id}/duplicate`,
    );
    return data;
  },

  publish: async (workspaceId: string, id: string): Promise<TemplateDetail> => {
    const { data } = await api.post<TemplateDetail>(
      `${base(workspaceId)}/${id}/publish`,
    );
    return data;
  },

  remove: async (workspaceId: string, id: string): Promise<void> => {
    await api.delete(`${base(workspaceId)}/${id}`);
  },
};
