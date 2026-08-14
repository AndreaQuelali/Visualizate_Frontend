import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Archive,
  ArchiveRestore,
  Copy,
  LayoutTemplate,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import { useActiveWorkspace } from '@/features/workspace/hooks/useActiveWorkspace';
import type { TemplateStatus, TemplateSummary } from '../api/templates.api';
import {
  useDeleteTemplate,
  useDuplicateTemplate,
  useTemplates,
  useUpdateTemplate,
} from '../hooks/useTemplates';
import CreateTemplateDialog from '../components/CreateTemplateDialog';

const STATUS_LABEL: Record<TemplateStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicada',
  ARCHIVED: 'Archivada',
};

export default function TemplatesPage() {
  const {
    workspaceId,
    canEditTemplates,
    isLoading: wsLoading,
  } = useActiveWorkspace();
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TemplateSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useTemplates(workspaceId, {
    status: showArchived ? 'ARCHIVED' : undefined,
    q: query.trim() || undefined,
  });
  const update = useUpdateTemplate(workspaceId ?? '');
  const duplicate = useDuplicateTemplate(workspaceId ?? '');
  const remove = useDeleteTemplate(workspaceId ?? '');

  if (!wsLoading && !workspaceId) {
    return <Navigate to="/workspaces" replace />;
  }

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setError(null);
    try {
      await action();
    } catch (err: unknown) {
      setError(getErrorMessage(err, fallback));
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Biblioteca
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
            Plantillas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Diseños reutilizables con campos variables y la identidad de tu
            marca.
          </p>
        </div>
        {canEditTemplates && workspaceId && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nueva plantilla
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar plantillas"
            aria-label="Buscar plantillas"
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

      {error && (
        <p className="mb-4 rounded-lg border-l-4 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {isLoading || wsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-muted/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudieron cargar las plantillas.{' '}
          <button className="underline" onClick={() => void refetch()}>
            Reintentar
          </button>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <LayoutTemplate className="size-8 text-muted-foreground" />
          <p className="font-medium">
            {query || showArchived
              ? 'No hay plantillas que coincidan'
              : 'Aún no hay plantillas'}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {canEditTemplates
              ? 'Crea tu primera plantilla para empezar a generar piezas.'
              : 'Un administrador o diseñador puede crear plantillas.'}
          </p>
          {canEditTemplates && !query && !showArchived && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nueva plantilla
            </Button>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <li
              key={tpl.id}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm',
                tpl.status === 'ARCHIVED' && 'opacity-70',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-medium" title={tpl.name}>
                    {canEditTemplates && tpl.status !== 'ARCHIVED' ? (
                      <Link
                        to={`/templates/${tpl.id}/edit`}
                        className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {tpl.name}
                      </Link>
                    ) : (
                      tpl.name
                    )}
                  </h2>
                  <p className="mt-1 line-clamp-2 min-h-8 text-sm text-muted-foreground">
                    {tpl.description || 'Sin descripción'}
                  </p>
                </div>
                {canEditTemplates && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Acciones de ${tpl.name}`}
                        />
                      }
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          void run(
                            () => duplicate.mutateAsync(tpl.id),
                            'No se pudo duplicar la plantilla',
                          )
                        }
                      >
                        <Copy className="size-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          void run(
                            () =>
                              update.mutateAsync({
                                id: tpl.id,
                                archived: tpl.status !== 'ARCHIVED',
                              }),
                            'No se pudo actualizar la plantilla',
                          )
                        }
                      >
                        {tpl.status === 'ARCHIVED' ? (
                          <ArchiveRestore className="size-4" />
                        ) : (
                          <Archive className="size-4" />
                        )}
                        {tpl.status === 'ARCHIVED' ? 'Restaurar' : 'Archivar'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setToDelete(tpl)}
                      >
                        <Trash2 className="size-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                <Badge
                  variant={tpl.status === 'PUBLISHED' ? 'default' : 'secondary'}
                >
                  {STATUS_LABEL[tpl.status]}
                </Badge>
                {tpl.hasUnpublishedChanges && tpl.status !== 'DRAFT' && (
                  <Badge variant="outline">Cambios sin publicar</Badge>
                )}
                {tpl.latestVersion !== null && (
                  <span className="text-muted-foreground">
                    v{tpl.latestVersion}
                  </span>
                )}
                {tpl.status === 'PUBLISHED' && (
                  <Link
                    to={`/pieces/new?template=${tpl.id}`}
                    className="ml-auto text-primary hover:underline"
                  >
                    Usar plantilla
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {workspaceId && (
        <CreateTemplateDialog
          workspaceId={workspaceId}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar plantilla</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar <strong>{toDelete?.name}</strong> y todas sus versiones?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={async () => {
                if (!toDelete) return;
                await run(
                  () => remove.mutateAsync(toDelete.id),
                  'No se pudo eliminar la plantilla',
                );
                setToDelete(null);
              }}
            >
              {remove.isPending && <Loader2 className="size-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
