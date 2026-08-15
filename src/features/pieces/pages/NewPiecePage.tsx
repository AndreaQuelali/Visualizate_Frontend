import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import { useActiveWorkspace } from '@/features/workspace/hooks/useActiveWorkspace';
import { useTemplates } from '@/features/templates/hooks/useTemplates';
import { useCreatePiece } from '../hooks/usePieces';

export default function NewPiecePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    workspaceId,
    canEditTemplates,
    isLoading: wsLoading,
  } = useActiveWorkspace();
  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useTemplates(workspaceId, { status: 'PUBLISHED' });
  const create = useCreatePiece(workspaceId ?? '');

  const [picked, setPicked] = useState<string | null>(params.get('template'));
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!wsLoading && !workspaceId) return <Navigate to="/workspaces" replace />;

  const selected = templates.find((t) => t.id === picked) ?? null;
  const titleError = title.trim() === '' ? 'El título es requerido' : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || titleError) return;
    setError(null);
    try {
      const piece = await create.mutateAsync({
        templateId: selected.id,
        title: title.trim(),
      });
      navigate(`/pieces/${piece.id}`, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo crear la pieza'));
    }
  };

  return (
    <PageContainer>
      <Link
        to="/pieces"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Volver a piezas
      </Link>
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
        Nueva pieza
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Elige una plantilla publicada y ponle un título.
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium">Plantilla</legend>
          {isLoading || wsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-muted/40"
                />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">
              No se pudieron cargar las plantillas.{' '}
              <button
                type="button"
                className="underline"
                onClick={() => void refetch()}
              >
                Reintentar
              </button>
            </p>
          ) : templates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-medium">No hay plantillas publicadas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {canEditTemplates
                  ? 'Publica una plantilla desde el editor para poder crear piezas.'
                  : 'Pide a un diseñador que publique una plantilla.'}
              </p>
              {canEditTemplates && (
                <Button className="mt-4" render={<Link to="/templates" />}>
                  Ir a plantillas
                </Button>
              )}
            </div>
          ) : (
            <ul
              role="radiogroup"
              aria-label="Plantilla"
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {templates.map((t) => {
                const active = t.id === picked;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPicked(t.id)}
                      className={cn(
                        'flex h-full w-full flex-col gap-1 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{t.name}</span>
                        {active && <Check className="size-4 text-primary" />}
                      </span>
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {t.description || 'Sin descripción'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>

        {templates.length > 0 && (
          <div className="max-w-md space-y-1.5">
            <Label htmlFor="piece-title">Título *</Label>
            <Input
              id="piece-title"
              value={title}
              maxLength={120}
              placeholder="Flyer concierto 12 de mayo"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg border-l-4 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {templates.length > 0 && (
          <Button
            type="submit"
            disabled={!selected || !!titleError || create.isPending}
          >
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            Crear pieza
          </Button>
        )}
      </form>
    </PageContainer>
  );
}
