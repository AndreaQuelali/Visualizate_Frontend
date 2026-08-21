import api from '@/lib/axios';
import type { PieceStatus } from '@/features/pieces/api/pieces.api';
import type { RenderStatus } from '@/features/render/api/render.api';

/** A block that failed on the server; the rest of the dashboard still loads. */
export interface BlockError {
  error: string;
}
export type Block<T> = T | BlockError;

export function isBlockError<T>(block: Block<T>): block is BlockError {
  return (
    typeof block === 'object' &&
    block !== null &&
    !Array.isArray(block) &&
    'error' in block &&
    typeof (block as BlockError).error === 'string'
  );
}

export interface Meter {
  used: number;
  limit: number;
}

export interface DashboardOnboarding {
  brand: boolean;
  template: boolean;
  piece: boolean;
}

export interface DashboardPiece {
  id: string;
  title: string;
  status: PieceStatus;
  templateName: string;
  updatedAt: string;
  thumbnailUrl: string | null;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  piecesCount: number;
}

export interface DashboardRender {
  id: string;
  pieceId: string;
  pieceTitle: string;
  format: 'PNG' | 'PDF';
  status: RenderStatus;
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface DashboardPendingReview {
  reviewId: string;
  pieceId: string;
  pieceTitle: string;
  pendingItems: number;
  createdAt: string;
}

export interface DashboardUsage {
  period: { start: string; end: string };
  storageBytes: Meter;
  activePieces: Meter;
  rendersPerMonth: Meter;
  reviewsPerMonth: Meter;
  piecesCreatedThisMonth: number;
}

export interface Dashboard {
  generatedAt: string;
  onboarding: Block<DashboardOnboarding>;
  recentPieces: Block<DashboardPiece[]>;
  topTemplates: Block<DashboardTemplate[]>;
  recentRenders: Block<DashboardRender[]>;
  pendingReviews: Block<DashboardPendingReview[]>;
  usage: Block<DashboardUsage>;
}

export const dashboardApi = {
  get: async (workspaceId: string): Promise<Dashboard> => {
    const { data } = await api.get<Dashboard>(
      `/workspaces/${workspaceId}/dashboard`,
    );
    return data;
  },
};
