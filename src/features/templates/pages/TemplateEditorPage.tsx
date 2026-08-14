import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useBlocker, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Redo2,
  Rocket,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
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
import { useBrand } from '@/features/brand/hooks/useBrand';
import { useBrandFonts } from '@/features/brand/hooks/useBrandFonts';
import { useAssets } from '@/features/assets/hooks/useAssets';
import {
  usePublishTemplate,
  useSaveDraft,
  useTemplate,
} from '../hooks/useTemplates';
import { createBlankDocument, isTemplateDocument } from '../types/document';
import {
  duplicateLayer,
  removeLayer,
  updateLayer,
} from '../editor/documentOps';
import { useEditorStore } from '../editor/editorStore';
import EditorStage from '../editor/EditorStage';
import LayersPanel from '../editor/LayersPanel';
import PropertiesPanel from '../editor/PropertiesPanel';
import FieldsPanel from '../editor/FieldsPanel';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
const ZOOMS = [0.25, 0.5, 0.75, 1, 1.5];
const SAVE_DELAY_MS = 2000;

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
  );
};

export default function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const {
    workspaceId,
    canEditTemplates,
    isLoading: wsLoading,
  } = useActiveWorkspace();
  const { data: template, isLoading, isError } = useTemplate(workspaceId, id);
  const { data: brand } = useBrand(workspaceId);
  const { data: assets = [] } = useAssets(workspaceId);
  useBrandFonts(brand, assets);
  const assetUrls = useMemo(
    () => Object.fromEntries(assets.map((a) => [a.id, a.url])),
    [assets],
  );

  const storeKey = useEditorStore((s) => s.key);
  const document = useEditorStore((s) => s.document);
  const dirty = useEditorStore((s) => s.dirty);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const load = useEditorStore((s) => s.load);
  const markSaved = useEditorStore((s) => s.markSaved);

  const saveDraft = useSaveDraft(workspaceId ?? '', id ?? '');
  const publish = usePublishTemplate(workspaceId ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [zoom, setZoom] = useState<number | 'fit'>('fit');
  const [box, setBox] = useState({ w: 0, h: 0 });
  const savingRef = useRef(false);
  const loadedFor = useRef<string | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  // Load the template document into the editor store (once per template).
  useEffect(() => {
    if (!template || loadedFor.current === template.id) return;
    loadedFor.current = template.id;
    load(
      isTemplateDocument(template.document)
        ? template.document
        : createBlankDocument(),
      template.id,
    );
  }, [template, load]);

  const stageRef = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!node) return;
    const ro = new ResizeObserver(([entry]) =>
      setBox({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      }),
    );
    ro.observe(node);
    roRef.current = ro;
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    const doc = useEditorStore.getState().document;
    if (!doc || savingRef.current) return false;
    savingRef.current = true;
    setSaveState('saving');
    try {
      await saveDraft.mutateAsync(doc);
      markSaved(doc);
      setSaveError(null);
      setSaveState('saved');
      return true;
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, 'No se pudo guardar el borrador'));
      setSaveState('error');
      return false;
    } finally {
      savingRef.current = false;
    }
  }, [saveDraft, markSaved]);

  // Debounced autosave.
  useEffect(() => {
    if (!dirty || saveState === 'saving') return;
    const t = setTimeout(() => void save(), SAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [document, dirty, saveState, save]);

  // Warn when closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const store = useEditorStore.getState();
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        store.redo();
        return;
      }
      const id = store.selectedId;
      const layer = store.document?.layers.find((l) => l.id === id);
      if (!layer) return;

      if (mod && key === 'd') {
        e.preventDefault();
        let newId: string | null = null;
        store.change((d) => {
          const r = duplicateLayer(d, layer.id);
          newId = r.newId;
          return r.doc;
        });
        if (newId) store.select(newId);
        return;
      }
      if (key === 'delete' || key === 'backspace') {
        if (layer.locked) return;
        e.preventDefault();
        store.change((d) => removeLayer(d, layer.id));
        store.select(null);
        return;
      }
      if (key === 'escape') {
        store.select(null);
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      const delta: Record<string, [number, number]> = {
        arrowleft: [-step, 0],
        arrowright: [step, 0],
        arrowup: [0, -step],
        arrowdown: [0, step],
      };
      if (delta[key] && !layer.locked) {
        e.preventDefault();
        const [dx, dy] = delta[key];
        store.change(
          (d) => updateLayer(d, layer.id, { x: layer.x + dx, y: layer.y + dy }),
          `nudge:${layer.id}`,
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const blocker = useBlocker(dirty);

  if (!wsLoading && !workspaceId) return <Navigate to="/workspaces" replace />;
  if (!wsLoading && !isLoading && !canEditTemplates) {
    return <Navigate to="/templates" replace />;
  }

  if (isLoading || wsLoading || !template || storeKey !== template.id) {
    return (
      <div className="-m-4 flex h-[calc(100vh-3.5rem)] items-center justify-center md:-m-6">
        {isError ? (
          <p className="text-sm text-destructive">
            No se pudo cargar la plantilla.{' '}
            <Link to="/templates" className="underline">
              Volver
            </Link>
          </p>
        ) : (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  const doc = document;
  if (!doc) return null;

  const fit = Math.max(
    0.1,
    Math.min(
      (box.w - 64) / doc.canvas.width,
      (box.h - 64) / doc.canvas.height,
      1,
    ),
  );
  const scale = zoom === 'fit' ? fit : zoom;

  const onPublish = async () => {
    setPublishMsg(null);
    if (dirty && !(await save())) {
      setPublishMsg({
        ok: false,
        text: 'No se pudo guardar antes de publicar',
      });
      return;
    }
    try {
      await publish.mutateAsync(template.id);
      setPublishMsg({ ok: true, text: 'Plantilla publicada' });
    } catch (err: unknown) {
      setPublishMsg({
        ok: false,
        text: getErrorMessage(err, 'No se pudo publicar la plantilla'),
      });
    }
  };

  const saveLabel =
    saveState === 'saving'
      ? 'Guardando…'
      : saveState === 'error'
        ? 'Error al guardar'
        : dirty
          ? 'Cambios sin guardar'
          : 'Guardado';

  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col md:-m-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Volver a plantillas"
          render={<Link to="/templates" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{template.name}</p>
          <p className="text-xs text-muted-foreground">
            {doc.canvas.width}×{doc.canvas.height} px
          </p>
        </div>
        <Badge
          variant={template.status === 'PUBLISHED' ? 'default' : 'secondary'}
        >
          {template.status === 'PUBLISHED'
            ? 'Publicada'
            : template.status === 'ARCHIVED'
              ? 'Archivada'
              : 'Borrador'}
        </Badge>

        <div className="ml-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Deshacer"
            title="Deshacer (Ctrl+Z)"
            disabled={!canUndo}
            onClick={() => useEditorStore.getState().undo()}
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Rehacer"
            title="Rehacer (Ctrl+Y)"
            disabled={!canRedo}
            onClick={() => useEditorStore.getState().redo()}
          >
            <Redo2 className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Alejar"
            onClick={() =>
              setZoom(ZOOMS.filter((z) => z < scale - 0.01).pop() ?? ZOOMS[0])
            }
          >
            <ZoomOut className="size-4" />
          </Button>
          <button
            type="button"
            onClick={() => setZoom('fit')}
            className="w-14 rounded-md px-1 text-center text-xs text-muted-foreground hover:bg-muted"
            title="Ajustar a la pantalla"
          >
            {Math.round(scale * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Acercar"
            onClick={() =>
              setZoom(
                ZOOMS.find((z) => z > scale + 0.01) ?? ZOOMS[ZOOMS.length - 1],
              )
            }
          >
            <ZoomIn className="size-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span
            role="status"
            className={cn(
              'flex items-center gap-1 text-xs',
              saveState === 'error'
                ? 'text-destructive'
                : 'text-muted-foreground',
            )}
          >
            {saveState === 'saving' ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : saveState !== 'error' && !dirty ? (
              <Check className="size-3.5" />
            ) : null}
            {saveLabel}
          </span>
          {saveState === 'error' && (
            <Button size="sm" variant="outline" onClick={() => void save()}>
              Reintentar
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => void onPublish()}
            disabled={publish.isPending || saveState === 'saving'}
          >
            {publish.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            Publicar
          </Button>
        </div>
      </div>

      {(saveError || publishMsg) && (
        <div
          role="alert"
          className={cn(
            'border-b px-3 py-1.5 text-sm',
            publishMsg?.ok
              ? 'border-border bg-muted/50 text-foreground'
              : 'border-destructive/30 bg-destructive/10 text-destructive',
          )}
        >
          {publishMsg?.text ?? saveError}
        </div>
      )}

      {/* Workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-[15rem_1fr_19rem]">
        <aside className="min-h-0 overflow-y-auto border-r border-border bg-sidebar/40">
          <LayersPanel brand={brand} />
        </aside>

        <div
          ref={stageRef}
          className="min-h-0 overflow-auto bg-muted/40"
          data-testid="editor-stage"
        >
          <div className="flex min-h-full min-w-full items-center justify-center p-8">
            <EditorStage scale={scale} brand={brand} assetUrls={assetUrls} />
          </div>
        </div>

        <aside className="min-h-0 overflow-y-auto border-l border-border bg-sidebar/40">
          <PropertiesPanel brand={brand} assets={assets} />
          <div className="border-t border-border" />
          <FieldsPanel />
          <div className="border-t border-border p-3 text-xs text-muted-foreground">
            <p className="mb-1 flex items-center gap-1 font-medium">
              <Copy className="size-3.5" /> Atajos
            </p>
            Ctrl+Z / Ctrl+Y deshacer y rehacer · Ctrl+D duplicar · Supr borrar ·
            flechas mover (Shift = 10 px) · Alt desactiva el imán.
          </div>
        </aside>
      </div>

      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hay cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Si sales ahora podrías perder los últimos cambios del diseño.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Seguir editando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (await save()) blocker.proceed?.();
              }}
            >
              Guardar y salir
            </AlertDialogAction>
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
