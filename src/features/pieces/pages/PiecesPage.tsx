import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FileImage, Plus, Search } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActiveWorkspace } from '@/features/workspace/hooks/useActiveWorkspace';
import { useDebounced } from '@/lib/useDebounced';
import type { PieceStatus } from '../api/pieces.api';
import { usePieces } from '../hooks/usePieces';

export const PIECE_STATUS_LABEL: Record<PieceStatus, string> = {
  DRAFT: 'Borrador',
  READY: 'Lista',
  ARCHIVED: 'Archivada',
};

export default function PiecesPage() {
  const { workspaceId, isLoading: wsLoading } = useActiveWorkspace();
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const q = useDebounced(query.trim(), 250);
  const {
    data: pieces = [],
    isLoading,
    isError,
    refetch,
  } = usePieces(workspaceId, {
    status: showArchived ? 'ARCHIVED' : undefined,
    q: q || undefined,
  });

  if (!wsLoading && !workspaceId) return <Navigate to="/workspaces" replace />;

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Contenido
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
            Piezas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada pieza se genera rellenando el formulario de una plantilla.
          </p>
        </div>
        <Button render={<Link to="/pieces/new" />}>
          <Plus className="size-4" />
          Nueva pieza
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar piezas"
            aria-label="Buscar piezas"
            className="pl-8"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="size-3.5 accent-primary"
          />
          Ver archivadas
        </label>
      </div>

      {isLoading || wsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-muted/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudieron cargar las piezas.{' '}
          <button className="underline" onClick={() => void refetch()}>
            Reintentar
          </button>
        </div>
      ) : pieces.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <FileImage className="size-8 text-muted-foreground" />
          <p className="font-medium">
            {q || showArchived
              ? 'No hay piezas que coincidan'
              : 'Aún no hay piezas'}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Elige una plantilla publicada y rellena el formulario para crear tu
            primera pieza.
          </p>
          {!q && !showArchived && (
            <Button render={<Link to="/pieces/new" />}>
              <Plus className="size-4" />
              Nueva pieza
            </Button>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map((p) => (
            <li key={p.id}>
              <Link
                to={`/pieces/${p.id}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0">
                  <h2 className="truncate font-medium" title={p.title}>
                    {p.title}
                  </h2>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {p.templateName} · v{p.templateVersion}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Badge
                    variant={p.status === 'READY' ? 'default' : 'secondary'}
                  >
                    {PIECE_STATUS_LABEL[p.status]}
                  </Badge>
                  {p.outdated && (
                    <Badge variant="outline">Plantilla actualizada</Badge>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(p.updatedAt).toLocaleDateString('es')}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
