import api from '@/lib/axios';
import type { OverrideProp } from '@/features/pieces/overrides';

export type ReviewStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type ReviewCategory = 'LEGIBILITY' | 'COMPOSITION' | 'CONTENT' | 'BRAND';
export type ReviewSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type ReviewSource = 'RULE' | 'AI';
export type ReviewItemStatus = 'PENDING' | 'APPLIED' | 'DISMISSED' | 'STALE';

export type Patch =
  | { kind: 'piece_data'; fieldKey: string; from: string; to: string }
  | {
      kind: 'layer_prop';
      layerId: string;
      prop: OverrideProp;
      from: unknown;
      to: unknown;
    };

export interface ReviewItem {
  id: string;
  reviewId: string;
  category: ReviewCategory;
  severity: ReviewSeverity;
  source: ReviewSource;
  title: string;
  explanation: string;
  target: { layerId?: string; fieldKey?: string } | null;
  patch: Patch | null;
  status: ReviewItemStatus;
  decidedAt: string | null;
}

export interface Review {
  id: string;
  pieceId: string;
  status: ReviewStatus;
  /** OK | SKIPPED_NO_KEY | DISABLED | FAILED | PENDING */
  aiStatus: string;
  summary: string | null;
  model: string | null;
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
  items: ReviewItem[];
}

export interface ReviewListEntry extends Omit<Review, 'items'> {
  items: never[];
  pendingCount: number;
  itemCount: number;
}

export interface ReviewSettings {
  aiEnabled: boolean;
  aiAvailable: boolean;
}

export interface ApplyManyResult {
  applied: string[];
  failed: Array<{ id: string; reason: string }>;
}

const base = (workspaceId: string) => `/workspaces/${workspaceId}`;

export const reviewApi = {
  request: async (workspaceId: string, pieceId: string) => {
    const { data } = await api.post<{ review: Review; reused: boolean }>(
      `${base(workspaceId)}/pieces/${pieceId}/reviews`,
    );
    return data;
  },

  list: async (workspaceId: string, pieceId: string) => {
    const { data } = await api.get<ReviewListEntry[]>(
      `${base(workspaceId)}/pieces/${pieceId}/reviews`,
    );
    return data;
  },

  get: async (workspaceId: string, reviewId: string) => {
    const { data } = await api.get<Review>(
      `${base(workspaceId)}/reviews/${reviewId}`,
    );
    return data;
  },

  apply: async (workspaceId: string, itemId: string) => {
    const { data } = await api.post<ReviewItem>(
      `${base(workspaceId)}/review-items/${itemId}/apply`,
    );
    return data;
  },

  dismiss: async (workspaceId: string, itemId: string) => {
    const { data } = await api.post<ReviewItem>(
      `${base(workspaceId)}/review-items/${itemId}/dismiss`,
    );
    return data;
  },

  revert: async (workspaceId: string, itemId: string) => {
    const { data } = await api.post<ReviewItem>(
      `${base(workspaceId)}/review-items/${itemId}/revert`,
    );
    return data;
  },

  applyMany: async (
    workspaceId: string,
    reviewId: string,
    itemIds: string[],
  ) => {
    const { data } = await api.post<ApplyManyResult>(
      `${base(workspaceId)}/reviews/${reviewId}/apply-all`,
      { itemIds },
    );
    return data;
  },

  getSettings: async (workspaceId: string) => {
    const { data } = await api.get<ReviewSettings>(
      `${base(workspaceId)}/review-settings`,
    );
    return data;
  },

  updateSettings: async (workspaceId: string, aiEnabled: boolean) => {
    const { data } = await api.put<ReviewSettings>(
      `${base(workspaceId)}/review-settings`,
      { aiEnabled },
    );
    return data;
  },
};
