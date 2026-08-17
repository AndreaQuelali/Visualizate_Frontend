import api from '@/lib/axios';

export type RenderFormat = 'PNG' | 'PDF';
export type RenderStatus =
  'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export interface RenderJob {
  id: string;
  pieceId: string;
  format: RenderFormat;
  scale: number;
  status: RenderStatus;
  attempts: number;
  errorCode: string | null;
  errorMessage: string | null;
  outputBytes: number | null;
  durationMs: number | null;
  createdAt: string;
  finishedAt: string | null;
  downloadable: boolean;
}

export interface RequestRenderPayload {
  format: RenderFormat;
  scale?: 1 | 2 | 3;
}

export interface DownloadInfo {
  url: string;
  filename: string;
  expiresInSeconds: number;
}

const base = (workspaceId: string) => `/workspaces/${workspaceId}`;

export const renderApi = {
  request: async (
    workspaceId: string,
    pieceId: string,
    payload: RequestRenderPayload,
  ): Promise<{ job: RenderJob; reused: boolean }> => {
    const { data } = await api.post<{ job: RenderJob; reused: boolean }>(
      `${base(workspaceId)}/pieces/${pieceId}/render`,
      payload,
    );
    return data;
  },

  list: async (workspaceId: string, pieceId: string): Promise<RenderJob[]> => {
    const { data } = await api.get<RenderJob[]>(
      `${base(workspaceId)}/pieces/${pieceId}/render-jobs`,
    );
    return data;
  },

  download: async (
    workspaceId: string,
    jobId: string,
  ): Promise<DownloadInfo> => {
    const { data } = await api.get<DownloadInfo>(
      `${base(workspaceId)}/render-jobs/${jobId}/download`,
    );
    return data;
  },

  cancel: async (workspaceId: string, jobId: string): Promise<RenderJob> => {
    const { data } = await api.post<RenderJob>(
      `${base(workspaceId)}/render-jobs/${jobId}/cancel`,
    );
    return data;
  },
};
