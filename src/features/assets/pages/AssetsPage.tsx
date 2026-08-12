import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FileType2, ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import { useActiveWorkspace } from '@/features/workspace/hooks/useActiveWorkspace';
import type { Asset, AssetKind } from '../api/assets.api';
import { useAssets, useDeleteAsset, useUploadAsset } from '../hooks/useAssets';

const FILTERS: Array<{ value: AssetKind | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'IMAGE', label: 'Imágenes' },
  { value: 'LOGO', label: 'Logos' },
  { value: 'FONT', label: 'Fuentes' },
];

const KIND_LABEL: Record<AssetKind, string> = {
  IMAGE: 'Imagen',
  LOGO: 'Logo',
  FONT: 'Fuente',
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetsPage() {
  const {
    workspaceId,
    canEditTemplates,
    isLoading: wsLoading,
  } = useActiveWorkspace();
  const {
    data: assets = [],
    isLoading,
    isError,
    refetch,
  } = useAssets(workspaceId);
  const upload = useUploadAsset(workspaceId ?? '');
  const remove = useDeleteAsset(workspaceId ?? '');

  const [filter, setFilter] = useState<AssetKind | 'ALL'>('ALL');
  const [asLogo, setAsLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Asset | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!wsLoading && !workspaceId) {
    return <Navigate to="/workspaces" replace />;
  }

  const visible =
    filter === 'ALL' ? assets : assets.filter((a) => a.kind === filter);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setError(null);
    for (const file of files) {
      try {
        await upload.mutateAsync({ file, kind: asLogo ? 'LOGO' : undefined });
      } catch (err: unknown) {
        setError(
          `${file.name}: ${getErrorMessage(err, 'No se pudo subir el archivo')}`,
        );
        break;
      }
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleteError(null);
    try {
      await remove.mutateAsync(toDelete.id);
      setToDelete(null);
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, 'No se pudo eliminar el asset'));
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
            Assets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Imágenes, logos y fuentes disponibles para tus plantillas.
          </p>
        </div>
        {canEditTemplates && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={asLogo}
                onChange={(e) => setAsLogo(e.target.checked)}
                className="size-3.5 accent-primary"
              />
              Subir imágenes como logo
            </label>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.woff2,.ttf"
              className="sr-only"
              onChange={onFiles}
              aria-label="Seleccionar archivos"
            />
            <Button
              onClick={() => inputRef.current?.click()}
              disabled={upload.isPending}
            >
              {upload.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {upload.isPending ? 'Subiendo…' : 'Subir archivos'}
            </Button>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === f.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border-l-4 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-muted/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudieron cargar los assets.{' '}
          <button className="underline" onClick={() => void refetch()}>
            Reintentar
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <ImageIcon className="size-8 text-muted-foreground" />
          <p className="font-medium">Aún no hay assets</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {canEditTemplates
              ? 'Sube logos, imágenes o fuentes para usarlos en tus plantillas.'
              : 'Un administrador o diseñador puede subir archivos aquí.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {visible.map((asset) => (
            <li
              key={asset.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="relative flex aspect-square items-center justify-center bg-muted/40">
                {asset.kind === 'FONT' ? (
                  <FileType2 className="size-10 text-muted-foreground" />
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    loading="lazy"
                    className="size-full object-contain p-2"
                  />
                )}
                {canEditTemplates && (
                  <Button
                    size="icon"
                    variant="destructive"
                    aria-label={`Eliminar ${asset.name}`}
                    className="absolute right-2 top-2 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                    onClick={() => {
                      setDeleteError(null);
                      setToDelete(asset);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-1 p-3">
                <p className="truncate text-sm font-medium" title={asset.name}>
                  {asset.name}
                </p>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{KIND_LABEL[asset.kind]}</Badge>
                  <span>
                    {asset.width && asset.height
                      ? `${asset.width}×${asset.height} · `
                      : ''}
                    {formatBytes(asset.sizeBytes)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar asset</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar <strong>{toDelete?.name}</strong>? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={remove.isPending}
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
