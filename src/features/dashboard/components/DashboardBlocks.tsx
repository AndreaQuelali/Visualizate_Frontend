import { Link } from 'react-router-dom';
import { FileImage, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ExportMenu from '@/features/render/components/ExportMenu';
import { PIECE_STATUS_LABEL } from '@/features/pieces/pages/PiecesPage';
import type { RenderStatus } from '@/features/render/api/render.api';
import type {
  DashboardPendingReview,
  DashboardPiece,
  DashboardRender,
  DashboardTemplate,
} from '../api/dashboard.api';
import { timeAgo } from '../format';

export function RecentPiecesList({
  workspaceId,
  pieces,
}: {
  workspaceId: string;
  pieces: DashboardPiece[];
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {pieces.map((p) => (
        <li
          key={p.id}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-background"
        >
          <Link
            to={`/pieces/${p.id}`}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          >
            <div className="flex aspect-square items-center justify-center bg-muted">
              {p.thumbnailUrl ? (
                <img
                  src={p.thumbnailUrl}
                  alt={`Vista previa de ${p.title}`}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <FileImage
                  className="size-8 text-muted-foreground/50"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="space-y-1 p-3">
              <p className="truncate text-sm font-medium group-hover:underline">
                {p.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {p.templateName} · {timeAgo(p.updatedAt)}
              </p>
            </div>
          </Link>
          <div className="mt-auto flex items-center justify-between gap-2 px-3 pb-3">
            <Badge variant={p.status === 'READY' ? 'default' : 'secondary'}>
              {PIECE_STATUS_LABEL[p.status]}
            </Badge>
            <ExportMenu
              workspaceId={workspaceId}
              pieceId={p.id}
              blockedReason={
                p.status === 'READY'
                  ? null
                  : 'Marca la pieza como lista para exportarla'
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TopTemplatesList({
  templates,
}: {
  templates: DashboardTemplate[];
}) {
  return (
    <ol className="space-y-2">
      {templates.map((t, i) => (
        <li key={t.id} className="flex items-center gap-3 text-sm">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {i + 1}
          </span>
          <span className="flex-1 truncate">{t.name}</span>
          <span className="text-xs text-muted-foreground">
            {t.piecesCount} {t.piecesCount === 1 ? 'pieza' : 'piezas'}
          </span>
        </li>
      ))}
    </ol>
  );
}

const RENDER_STATUS_LABEL: Record<RenderStatus, string> = {
  QUEUED: 'En curso',
  RUNNING: 'En curso',
  SUCCEEDED: 'Listo',
  FAILED: 'Fallido',
  CANCELLED: 'Cancelado',
};

function renderBadgeVariant(status: RenderStatus) {
  if (status === 'FAILED') return 'destructive' as const;
  if (status === 'SUCCEEDED') return 'default' as const;
  return 'secondary' as const;
}

export function RecentRendersList({ renders }: { renders: DashboardRender[] }) {
  return (
    <ul className="divide-y divide-border">
      {renders.map((r) => {
        const active = r.status === 'QUEUED' || r.status === 'RUNNING';
        return (
          <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
            <div className="min-w-0 flex-1">
              <Link
                to={`/pieces/${r.pieceId}`}
                className="block truncate font-medium hover:underline"
              >
                {r.pieceTitle}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {r.format} · {timeAgo(r.createdAt)}
                {r.status === 'FAILED' && r.errorMessage
                  ? ` · ${r.errorMessage}`
                  : ''}
              </p>
            </div>
            <Badge variant={renderBadgeVariant(r.status)}>
              {active && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {RENDER_STATUS_LABEL[r.status]}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

export function PendingReviewsList({
  reviews,
}: {
  reviews: DashboardPendingReview[];
}) {
  return (
    <ul className="divide-y divide-border">
      {reviews.map((r) => (
        <li key={r.reviewId} className="flex items-center gap-3 py-2 text-sm">
          <Link
            to={`/pieces/${r.pieceId}`}
            className="min-w-0 flex-1 truncate font-medium hover:underline"
          >
            {r.pieceTitle}
          </Link>
          <Badge variant="secondary">{r.pendingItems} por decidir</Badge>
        </li>
      ))}
    </ul>
  );
}
