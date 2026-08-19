import { useState } from 'react';
import { Download, Loader2, RotateCcw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/errors';
import type { RenderJob, RenderStatus } from '../api/render.api';
import {
  downloadRender,
  useCancelRender,
  useRenderJobs,
  useRequestRender,
} from '../hooks/useRender';

const STATUS_LABEL: Record<RenderStatus, string> = {
  QUEUED: 'En cola',
  RUNNING: 'Procesando',
  SUCCEEDED: 'Listo',
  FAILED: 'Falló',
  CANCELLED: 'Cancelado',
};

export function formatBytes(bytes: number | null) {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function jobLabel(job: Pick<RenderJob, 'format' | 'scale'>) {
  return job.format === 'PDF' ? 'PDF' : `PNG ${job.scale}×`;
}

interface RenderHistoryProps {
  workspaceId: string;
  pieceId: string;
  /** Re-export is only allowed when the piece can be exported. */
  canRetry: boolean;
}

export default function RenderHistory({
  workspaceId,
  pieceId,
  canRetry,
}: RenderHistoryProps) {
  const {
    data: jobs = [],
    isLoading,
    isError,
    refetch,
  } = useRenderJobs(workspaceId, pieceId);
  const cancel = useCancelRender(workspaceId, pieceId);
  const retry = useRequestRender(workspaceId, pieceId);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>, fallback: string) => {
    setError(null);
    try {
      await fn();
    } catch (err: unknown) {
      setError(getErrorMessage(err, fallback));
    }
  };

  const onDownload = async (job: RenderJob) => {
    setDownloading(job.id);
    await run(
      () => downloadRender(workspaceId, job.id),
      'No se pudo descargar el archivo',
    );
    setDownloading(null);
  };

  return (
    <section aria-label="Historial de exportaciones" className="space-y-2">
      <h2 className="text-sm font-medium">Exportaciones</h2>

      {isLoading ? (
        <div className="h-12 animate-pulse rounded-lg bg-muted/40" />
      ) : isError ? (
        <p className="text-sm text-destructive">
          No se pudo cargar el historial.{' '}
          <button className="underline" onClick={() => void refetch()}>
            Reintentar
          </button>
        </p>
      ) : jobs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          Aún no exportaste esta pieza.
        </p>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => {
            const active = job.status === 'QUEUED' || job.status === 'RUNNING';
            return (
              <li
                key={job.id}
                className="space-y-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{jobLabel(job)}</span>
                  <Badge
                    variant={
                      job.status === 'SUCCEEDED'
                        ? 'default'
                        : job.status === 'FAILED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {active && <Loader2 className="size-3 animate-spin" />}
                    {STATUS_LABEL[job.status]}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleString('es', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                    {job.outputBytes !== null &&
                      ` · ${formatBytes(job.outputBytes)}`}
                  </span>
                </div>

                {job.status === 'FAILED' && (
                  <p className="text-xs text-destructive">
                    {job.errorMessage ?? 'La exportación falló'}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  {job.downloadable && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={downloading === job.id}
                      onClick={() => void onDownload(job)}
                    >
                      {downloading === job.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Download className="size-4" />
                      )}
                      Descargar
                    </Button>
                  )}
                  {active && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={cancel.isPending}
                      onClick={() =>
                        void run(
                          () => cancel.mutateAsync(job.id),
                          'No se pudo cancelar',
                        )
                      }
                    >
                      <X className="size-4" />
                      Cancelar
                    </Button>
                  )}
                  {(job.status === 'FAILED' || job.status === 'CANCELLED') && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={!canRetry || retry.isPending}
                      onClick={() =>
                        void run(
                          () =>
                            retry.mutateAsync({
                              format: job.format,
                              ...(job.format === 'PNG'
                                ? { scale: job.scale as 1 | 2 | 3 }
                                : {}),
                            }),
                          'No se pudo reintentar',
                        )
                      }
                    >
                      <RotateCcw className="size-4" />
                      Reintentar
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
