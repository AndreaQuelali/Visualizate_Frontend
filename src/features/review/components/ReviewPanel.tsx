import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Loader2,
  ScanSearch,
  Sparkles,
  Undo2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { getErrorMessage, getRetryAfterSeconds } from '@/lib/errors';
import { cn } from '@/lib/utils';
import type {
  Patch,
  ReviewCategory,
  ReviewItem,
  ReviewSeverity,
} from '../api/review.api';
import {
  useRequestReview,
  useReview,
  useReviewActions,
  useReviews,
  useReviewSettings,
  useUpdateReviewSettings,
} from '../hooks/useReview';
import { describePatch } from '../preview';

const CATEGORY_LABEL: Record<ReviewCategory, string> = {
  LEGIBILITY: 'Legibilidad',
  COMPOSITION: 'Composición',
  CONTENT: 'Contenido',
  BRAND: 'Marca',
};
const SEVERITY_LABEL: Record<ReviewSeverity, string> = {
  CRITICAL: 'Crítico',
  WARNING: 'Aviso',
  INFO: 'Sugerencia',
};

const selectClass =
  'h-8 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function aiNotice(
  aiStatus: string,
  error: string | null,
): string | null {
  switch (aiStatus) {
    case 'SKIPPED_NO_KEY':
      return 'La revisión con IA no está configurada en el servidor; solo se aplicaron las reglas automáticas.';
    case 'DISABLED':
      return 'La revisión con IA está desactivada en este espacio; solo se aplicaron las reglas automáticas.';
    case 'FAILED':
      return `${error ?? 'La IA no estuvo disponible'}. Se muestran solo las reglas automáticas.`;
    default:
      return null;
  }
}

interface ReviewPanelProps {
  workspaceId: string;
  pieceId: string;
  isAdmin: boolean;
  /** Unsaved edits make review decisions unsafe (they compare against saved data). */
  dirty: boolean;
  archived: boolean;
  /** Hovering/focusing an item previews it on the canvas. */
  onPreview: (item: ReviewItem | null) => void;
  /** The piece changed on the server: reload the editor. */
  onPieceChanged: (message: string) => void;
}

export default function ReviewPanel({
  workspaceId,
  pieceId,
  isAdmin,
  dirty,
  archived,
  onPreview,
  onPieceChanged,
}: ReviewPanelProps) {
  const { data: list = [], isLoading: listLoading } = useReviews(
    workspaceId,
    pieceId,
  );
  const latestId = list[0]?.id;
  const { data: review, isError } = useReview(workspaceId, latestId);
  const request = useRequestReview(workspaceId, pieceId);
  const actions = useReviewActions(workspaceId, pieceId);
  const { data: settings } = useReviewSettings(workspaceId);
  const updateSettings = useUpdateReviewSettings(workspaceId);

  const [category, setCategory] = useState<ReviewCategory | 'ALL'>('ALL');
  const [severity, setSeverity] = useState<ReviewSeverity | 'ALL'>('ALL');
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [confirmMany, setConfirmMany] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const running = review?.status === 'QUEUED' || review?.status === 'RUNNING';
  const blocked = dirty
    ? 'Guarda tus cambios para revisar y aplicar recomendaciones.'
    : archived
      ? 'La pieza está archivada.'
      : null;

  const items = (review?.items ?? []).filter(
    (i) =>
      (category === 'ALL' || i.category === category) &&
      (severity === 'ALL' || i.severity === severity),
  );
  const selectable = items.filter((i) => i.status === 'PENDING' && i.patch);
  const chosen = selectable.filter((i) => selected.has(i.id));

  const run = async <T,>(fn: () => Promise<T>, fallback: string) => {
    setError(null);
    try {
      return await fn();
    } catch (err: unknown) {
      const wait = getRetryAfterSeconds(err);
      const base = getErrorMessage(err, fallback);
      setError(wait ? `${base}. Reintenta en ${wait} s.` : base);
      return undefined;
    }
  };

  const onRequest = async () => {
    setMessage(null);
    setSelected(new Set());
    await run(() => request.mutateAsync(), 'No se pudo iniciar la revisión');
  };

  const onApply = async (item: ReviewItem) => {
    const res = await run(
      () => actions.apply.mutateAsync(item.id),
      'No se pudo aplicar la recomendación',
    );
    if (res) {
      onPreview(null);
      onPieceChanged(
        'Recomendación aplicada. La exportación anterior ya no refleja la pieza: vuelve a exportar y a revisar.',
      );
    }
  };

  const onRevert = async (item: ReviewItem) => {
    const res = await run(
      () => actions.revert.mutateAsync(item.id),
      'No se pudo deshacer el cambio',
    );
    if (res) onPieceChanged('Cambio deshecho.');
  };

  const onApplyMany = async () => {
    setConfirmMany(false);
    if (!review) return;
    const res = await run(
      () =>
        actions.applyMany.mutateAsync({
          reviewId: review.id,
          itemIds: chosen.map((i) => i.id),
        }),
      'No se pudieron aplicar las recomendaciones',
    );
    if (!res) return;
    setSelected(new Set());
    onPreview(null);
    if (res.failed.length > 0) {
      setMessage(
        `Se aplicaron ${res.applied.length}; ${res.failed.length} no se pudieron aplicar (${res.failed[0].reason}).`,
      );
    }
    if (res.applied.length > 0) {
      onPieceChanged(
        `Se aplicaron ${res.applied.length} recomendaciones. Vuelve a exportar y a revisar.`,
      );
    }
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const notice = review ? aiNotice(review.aiStatus, review.errorMessage) : null;

  return (
    <section aria-label="Revisión de la pieza" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-medium">
          <ScanSearch className="size-4" />
          Revisión
        </h2>
        <Button
          type="button"
          size="sm"
          className="ml-auto"
          disabled={!!blocked || running || request.isPending}
          title={blocked ?? undefined}
          onClick={() => void onRequest()}
        >
          {running || request.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {running ? 'Revisando…' : review ? 'Revisar de nuevo' : 'Revisar'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Detectamos problemas con reglas automáticas y, si está activada, con IA.
        {settings?.aiEnabled && settings.aiAvailable
          ? ' Al revisar se envían la imagen y el texto de la pieza a un proveedor externo de IA.'
          : ''}{' '}
        Tú decides qué recomendaciones aplicar.
      </p>

      {isAdmin && settings?.aiAvailable && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="size-3.5 accent-primary"
            checked={settings.aiEnabled}
            disabled={updateSettings.isPending}
            onChange={(e) => updateSettings.mutate(e.target.checked)}
          />
          Usar IA en las revisiones de este espacio
        </label>
      )}

      {blocked && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{blocked}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-xs text-muted-foreground">
          {message}
        </p>
      )}

      {listLoading ? (
        <div className="h-12 animate-pulse rounded-lg bg-muted/40" />
      ) : !review ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          Aún no revisaste esta pieza.
        </p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          No se pudo cargar la revisión.
        </p>
      ) : running ? (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="size-4 animate-spin" />
          Analizando composición, legibilidad y contenido…
        </p>
      ) : review.status === 'FAILED' ? (
        <p role="alert" className="text-sm text-destructive">
          {review.errorMessage ?? 'La revisión falló.'} Puedes reintentarlo.
        </p>
      ) : (
        <>
          {review.summary && (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
              {review.summary}
            </p>
          )}
          {notice && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {notice}
            </p>
          )}

          {review.items.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
              <Check className="size-4 text-emerald-500" />
              Todo en orden
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filtrar por categoría"
                  className={selectClass}
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ReviewCategory | 'ALL')
                  }
                >
                  <option value="ALL">Todas las categorías</option>
                  {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filtrar por severidad"
                  className={selectClass}
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as ReviewSeverity | 'ALL')
                  }
                >
                  <option value="ALL">Toda severidad</option>
                  {Object.entries(SEVERITY_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  disabled={
                    chosen.length === 0 ||
                    !!blocked ||
                    actions.applyMany.isPending
                  }
                  onClick={() => setConfirmMany(true)}
                >
                  Aplicar seleccionadas ({chosen.length})
                </Button>
              </div>

              <ul className="space-y-2">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    checked={selected.has(item.id)}
                    onToggle={() => toggle(item.id)}
                    onPreview={onPreview}
                    disabled={!!blocked}
                    busy={
                      actions.apply.isPending ||
                      actions.dismiss.isPending ||
                      actions.revert.isPending
                    }
                    onApply={() => void onApply(item)}
                    onDismiss={() =>
                      void run(
                        () => actions.dismiss.mutateAsync(item.id),
                        'No se pudo descartar',
                      )
                    }
                    onRevert={() => void onRevert(item)}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <AlertDialog open={confirmMany} onOpenChange={setConfirmMany}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Aplicar {chosen.length} recomendaciones
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se modificará esta pieza (no la plantilla). Podrás deshacer cada
              cambio por separado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onApplyMany()}>
              Aplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

interface ItemCardProps {
  item: ReviewItem;
  checked: boolean;
  disabled: boolean;
  busy: boolean;
  onToggle: () => void;
  onPreview: (item: ReviewItem | null) => void;
  onApply: () => void;
  onDismiss: () => void;
  onRevert: () => void;
}

function ItemCard({
  item,
  checked,
  disabled,
  busy,
  onToggle,
  onPreview,
  onApply,
  onDismiss,
  onRevert,
}: ItemCardProps) {
  const pending = item.status === 'PENDING';
  const patch: Patch | null = item.patch;

  return (
    <li
      onMouseEnter={() => pending && onPreview(item)}
      onMouseLeave={() => onPreview(null)}
      onFocus={() => pending && onPreview(item)}
      onBlur={() => onPreview(null)}
      className={cn(
        'space-y-2 rounded-xl border border-border bg-card p-3 text-sm',
        !pending && 'opacity-70',
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {pending && patch && (
          <input
            type="checkbox"
            className="size-3.5 accent-primary"
            aria-label={`Seleccionar: ${item.title}`}
            checked={checked}
            onChange={onToggle}
          />
        )}
        <Badge
          variant={
            item.severity === 'CRITICAL'
              ? 'destructive'
              : item.severity === 'WARNING'
                ? 'default'
                : 'secondary'
          }
        >
          {SEVERITY_LABEL[item.severity]}
        </Badge>
        <Badge variant="outline">{CATEGORY_LABEL[item.category]}</Badge>
        <Badge variant="outline">{item.source === 'AI' ? 'IA' : 'Regla'}</Badge>
        {item.status === 'APPLIED' && <Badge>Aplicada</Badge>}
        {item.status === 'DISMISSED' && (
          <Badge variant="secondary">Descartada</Badge>
        )}
        {item.status === 'STALE' && <Badge variant="secondary">Obsoleta</Badge>}
      </div>

      <p className="font-medium">{item.title}</p>
      <p className="text-muted-foreground">{item.explanation}</p>
      {patch && (
        <p className="rounded-md bg-muted/50 px-2 py-1 font-mono text-xs">
          {describePatch(patch)}
        </p>
      )}
      {!patch && pending && (
        <p className="text-xs text-muted-foreground">
          Es un consejo: no tiene cambio automático.
        </p>
      )}
      {item.status === 'STALE' && (
        <p className="text-xs text-muted-foreground">
          La pieza cambió después de la revisión. Vuelve a revisar.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {pending && patch && (
          <Button
            type="button"
            size="sm"
            disabled={disabled || busy}
            onClick={onApply}
          >
            <Check className="size-4" />
            Aplicar
          </Button>
        )}
        {pending && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={onDismiss}
          >
            <X className="size-4" />
            Descartar
          </Button>
        )}
        {item.status === 'APPLIED' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || busy}
            onClick={onRevert}
          >
            <Undo2 className="size-4" />
            Deshacer
          </Button>
        )}
      </div>
    </li>
  );
}
