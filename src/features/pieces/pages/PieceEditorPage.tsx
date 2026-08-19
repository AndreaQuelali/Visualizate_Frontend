import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Link,
  Navigate,
  useBlocker,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { getErrorMessage, getFieldErrors } from '@/lib/errors';
import { useDebounced } from '@/lib/useDebounced';
import { useActiveWorkspace } from '@/features/workspace/hooks/useActiveWorkspace';
import { useBrand } from '@/features/brand/hooks/useBrand';
import { useBrandFonts } from '@/features/brand/hooks/useBrandFonts';
import { useAssets } from '@/features/assets/hooks/useAssets';
import type { Asset } from '@/features/assets/api/assets.api';
import type { Brand } from '@/features/brand/api/brand.api';
import TemplateCanvas from '@/features/templates/canvas/TemplateCanvas';
import {
  isTemplateDocument,
  type TemplateDocument,
} from '@/features/templates/types/document';
import type { PieceDetail, PieceStatus } from '../api/pieces.api';
import {
  useDeletePiece,
  usePiece,
  useUpdatePiece,
  useUpgradePiece,
} from '../hooks/usePieces';
import { buildPieceSchema, toFormValues } from '../schema';
import FieldInput from '../components/FieldInput';
import ExportMenu from '@/features/render/components/ExportMenu';
import RenderHistory from '@/features/render/components/RenderHistory';
import ReviewPanel from '@/features/review/components/ReviewPanel';
import type { ReviewItem } from '@/features/review/api/review.api';
import { applyPatchPreview } from '@/features/review/preview';
import { applyOverrides } from '../overrides';
import { PIECE_STATUS_LABEL } from './PiecesPage';

type Values = Record<string, string>;

interface WorkbenchProps {
  piece: PieceDetail;
  doc: TemplateDocument;
  brand?: Brand;
  assets: Asset[];
  workspaceId: string;
  canUpload: boolean;
  isAdmin: boolean;
  onNotice: (text: string) => void;
  /** The piece was changed on the server (review applied/reverted). */
  onPieceChanged: (message: string) => void;
}

function Workbench({
  piece,
  doc,
  brand,
  assets,
  workspaceId,
  canUpload,
  isAdmin,
  onNotice,
  onPieceChanged,
}: WorkbenchProps) {
  const navigate = useNavigate();
  const update = useUpdatePiece(workspaceId, piece.id);
  const upgrade = useUpgradePiece(workspaceId, piece.id);
  const remove = useDeletePiece(workspaceId);
  const archived = piece.status === 'ARCHIVED';

  const {
    control,
    getValues,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(
      buildPieceSchema(doc.fields, false),
    ) as Resolver<Values>,
    defaultValues: toFormValues(doc.fields, piece.data),
    mode: 'onChange',
  });

  const [title, setTitle] = useState(piece.title);
  const [savedTitle, setSavedTitle] = useState(piece.title);
  const [banner, setBanner] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [overflowIds, setOverflowIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const overflowRef = useRef<Set<string>>(new Set());
  const roRef = useRef<ResizeObserver | null>(null);
  const [width, setWidth] = useState(0);

  const values = watch();
  const preview = useDebounced(values, 150);
  const [previewItem, setPreviewItem] = useState<ReviewItem | null>(null);
  // Template + applied recommendations; hovering a pending one shows its result.
  const baseDoc = useMemo(
    () => applyOverrides(doc, piece.overrides),
    [doc, piece.overrides],
  );
  const shown = useMemo(
    () =>
      previewItem?.patch
        ? applyPatchPreview(baseDoc, preview, previewItem.patch)
        : { doc: baseDoc, data: preview },
    [baseDoc, preview, previewItem],
  );
  const highlight = previewItem?.target?.layerId
    ? shown.doc.layers.find((l) => l.id === previewItem.target?.layerId)
    : undefined;
  const dirty = isDirty || title.trim() !== savedTitle;
  const blocker = useBlocker(dirty && !update.isPending);

  const previewRef = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!node) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(node);
    roRef.current = ro;
  }, []);

  const onTextOverflow = useCallback((layerId: string, overflow: boolean) => {
    const set = overflowRef.current;
    if (set.has(layerId) === overflow) return;
    if (overflow) set.add(layerId);
    else set.delete(layerId);
    setOverflowIds(new Set(set));
  }, []);

  const overflowFields = useMemo(() => {
    const keys = new Set<string>();
    for (const l of doc.layers) {
      if (l.bind && overflowIds.has(l.id)) keys.add(l.bind.fieldKey);
    }
    return keys;
  }, [doc.layers, overflowIds]);

  const assetUrls = useMemo(
    () => Object.fromEntries(assets.map((a) => [a.id, a.url])),
    [assets],
  );

  const scale = Math.max(
    0.1,
    Math.min(
      width > 0 ? width / doc.canvas.width : 1,
      560 / doc.canvas.height,
      1,
    ),
  );

  const exportBlockedReason =
    piece.status !== 'READY'
      ? 'Marca la pieza como lista para exportarla.'
      : dirty
        ? 'Guarda tus cambios para exportar la última versión.'
        : null;

  const persist = async (status?: PieceStatus): Promise<boolean> => {
    setBanner(null);
    setSavedAt(false);
    clearErrors();
    const current = getValues();

    const result = buildPieceSchema(doc.fields, status === 'READY').safeParse(
      current,
    );
    if (!result.success) {
      for (const issue of result.error.issues) {
        setError(String(issue.path[0]), { message: issue.message });
      }
      setBanner(
        status === 'READY'
          ? 'Completa los campos obligatorios para marcarla como lista'
          : 'Revisa los campos con errores',
      );
      return false;
    }
    if (title.trim() === '') {
      setBanner('El título es requerido');
      return false;
    }

    try {
      await update.mutateAsync({
        title: title.trim(),
        data: current,
        ...(status ? { status } : {}),
      });
      reset(current);
      setSavedTitle(title.trim());
      setSavedAt(true);
      return true;
    } catch (err: unknown) {
      for (const [field, message] of Object.entries(getFieldErrors(err))) {
        setError(field, { message });
      }
      setBanner(getErrorMessage(err, 'No se pudo guardar la pieza'));
      return false;
    }
  };

  const setStatus = async (status: PieceStatus) => {
    setBanner(null);
    try {
      await update.mutateAsync({ status });
    } catch (err: unknown) {
      setBanner(getErrorMessage(err, 'No se pudo cambiar el estado'));
    }
  };

  const onUpgrade = async () => {
    setBanner(null);
    try {
      const res = await upgrade.mutateAsync();
      const parts = ['Pieza actualizada a la última versión de la plantilla.'];
      if (res.dropped.length > 0) {
        parts.push(`Se descartaron valores de: ${res.dropped.join(', ')}.`);
      }
      if (res.revertedToDraft) {
        parts.push('Volvió a borrador: faltan campos obligatorios.');
      }
      onNotice(parts.join(' '));
    } catch (err: unknown) {
      setBanner(getErrorMessage(err, 'No se pudo actualizar la pieza'));
    }
  };

  return (
    <div className="space-y-4">
      <Link
        to="/pieces"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Volver a piezas
      </Link>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <Label
            htmlFor="piece-title"
            className="text-xs text-muted-foreground"
          >
            Título
          </Label>
          <Input
            id="piece-title"
            value={title}
            maxLength={120}
            disabled={archived}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-lg text-base font-medium"
          />
        </div>
        <Badge variant={piece.status === 'READY' ? 'default' : 'secondary'}>
          {PIECE_STATUS_LABEL[piece.status]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {piece.templateName} · v{piece.templateVersion}
        </span>
      </div>

      {piece.outdated && !archived && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <RefreshCw className="size-4 shrink-0" />
          <span className="flex-1">
            La plantilla tiene una versión más reciente. Esta pieza sigue usando
            la v{piece.templateVersion}.
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={dirty || upgrade.isPending}
            title={dirty ? 'Guarda tus cambios antes de actualizar' : undefined}
            onClick={() => void onUpgrade()}
          >
            {upgrade.isPending && <Loader2 className="size-4 animate-spin" />}
            Actualizar a la última versión
          </Button>
        </div>
      )}

      {banner && (
        <p
          role="alert"
          className="rounded-lg border-l-4 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {banner}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void persist();
          }}
          className="space-y-4"
          noValidate
        >
          <fieldset disabled={archived} className="space-y-4">
            {doc.fields.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Esta plantilla no tiene campos para rellenar.
              </p>
            ) : (
              doc.fields.map((f) => (
                <Controller
                  key={f.key}
                  name={f.key}
                  control={control}
                  render={({ field }) => (
                    <FieldInput
                      field={f}
                      value={field.value ?? ''}
                      onChange={(value) => {
                        field.onChange(value);
                        setBanner(null);
                      }}
                      error={errors[f.key]?.message}
                      workspaceId={workspaceId}
                      assets={assets}
                      canUpload={canUpload}
                      overflow={overflowFields.has(f.key)}
                    />
                  )}
                />
              ))
            )}
          </fieldset>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {!archived && (
              <>
                <Button type="submit" disabled={update.isPending || !dirty}>
                  {update.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Guardar borrador
                </Button>
                {piece.status === 'READY' ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={update.isPending}
                    onClick={() => void setStatus('DRAFT')}
                  >
                    Volver a borrador
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={update.isPending}
                    onClick={() => void persist('READY')}
                  >
                    Marcar como lista
                  </Button>
                )}
              </>
            )}
            {savedAt && !dirty && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="size-4" />
                Guardado
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExportMenu
              workspaceId={workspaceId}
              pieceId={piece.id}
              blockedReason={exportBlockedReason}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={update.isPending}
              onClick={() => void setStatus(archived ? 'DRAFT' : 'ARCHIVED')}
            >
              {archived ? (
                <ArchiveRestore className="size-4" />
              ) : (
                <Archive className="size-4" />
              )}
              {archived ? 'Restaurar' : 'Archivar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>

          <RenderHistory
            workspaceId={workspaceId}
            pieceId={piece.id}
            canRetry={piece.status === 'READY' && !dirty}
          />
        </form>

        <div
          ref={previewRef}
          className="min-w-0 rounded-2xl border border-border bg-muted/40 p-4"
          aria-label="Vista previa"
        >
          <div className="flex justify-center">
            <TemplateCanvas
              document={shown.doc}
              data={shown.data}
              brand={brand}
              assetUrls={assetUrls}
              scale={scale}
              onTextOverflow={onTextOverflow}
              overlay={
                highlight ? (
                  <div
                    className="absolute"
                    style={{
                      left: highlight.x,
                      top: highlight.y,
                      width: highlight.width,
                      height: highlight.height,
                      outline: `${4 / scale}px dashed #4648d4`,
                      outlineOffset: `${2 / scale}px`,
                    }}
                  />
                ) : undefined
              }
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {doc.canvas.width}×{doc.canvas.height} px ·{' '}
            {previewItem?.patch
              ? 'así quedaría con la recomendación'
              : 'vista previa en vivo'}
          </p>
          <div className="mt-4 border-t border-border pt-4">
            <ReviewPanel
              workspaceId={workspaceId}
              pieceId={piece.id}
              isAdmin={isAdmin}
              dirty={dirty}
              archived={archived}
              onPreview={setPreviewItem}
              onPieceChanged={onPieceChanged}
            />
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar pieza</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar <strong>{savedTitle}</strong>? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={async () => {
                try {
                  await remove.mutateAsync(piece.id);
                  navigate('/pieces', { replace: true });
                } catch (err: unknown) {
                  setConfirmDelete(false);
                  setBanner(getErrorMessage(err, 'No se pudo eliminar'));
                }
              }}
            >
              {remove.isPending && <Loader2 className="size-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hay cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Si sales ahora perderás los cambios de esta pieza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Seguir editando
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => blocker.proceed?.()}
            >
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PieceEditorPage() {
  const { id } = useParams<{ id: string }>();
  const {
    workspaceId,
    canEditTemplates,
    isAdmin,
    isLoading: wsLoading,
  } = useActiveWorkspace();
  const {
    data: piece,
    isLoading,
    isError,
    refetch,
  } = usePiece(workspaceId, id);
  const { data: brand } = useBrand(workspaceId);
  const { data: assets = [] } = useAssets(workspaceId);
  useBrandFonts(brand, assets);
  const [notice, setNotice] = useState<string | null>(null);
  // Bumped when the piece changes server-side so the form reloads clean.
  const [revision, setRevision] = useState(0);

  if (!wsLoading && !workspaceId) return <Navigate to="/workspaces" replace />;

  if (isLoading || wsLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />;
  }
  if (isError || !piece || !workspaceId) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        No se pudo cargar la pieza.{' '}
        <button className="underline" onClick={() => void refetch()}>
          Reintentar
        </button>{' '}
        ·{' '}
        <Link to="/pieces" className="underline">
          Volver
        </Link>
      </div>
    );
  }
  if (!isTemplateDocument(piece.document)) {
    return (
      <p className="text-sm text-destructive">
        El documento de la plantilla de esta pieza no es válido.
      </p>
    );
  }

  return (
    <>
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
        >
          {notice}
        </p>
      )}
      <Workbench
        key={`${piece.id}:${piece.templateVersionId}:${revision}`}
        piece={piece}
        doc={piece.document}
        brand={brand}
        assets={assets}
        workspaceId={workspaceId}
        canUpload={canEditTemplates}
        isAdmin={isAdmin}
        onNotice={setNotice}
        onPieceChanged={(message) => {
          setNotice(message);
          setRevision((r) => r + 1);
        }}
      />
    </>
  );
}
