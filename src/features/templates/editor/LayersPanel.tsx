import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Lock,
  LockOpen,
  Shapes,
  Trash2,
  Type,
} from 'lucide-react';
import type { Brand } from '@/features/brand/api/brand.api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MAX_LAYERS,
  type Layer,
  type TemplateDocument,
} from '../types/document';
import {
  addLayer,
  makeImageLayer,
  makeShapeLayer,
  makeTextLayer,
  removeLayer,
  reorderLayer,
  updateLayer,
} from './documentOps';
import { useEditorStore } from './editorStore';

const ICONS = { text: Type, image: ImageIcon, shape: Shapes } as const;

export default function LayersPanel({ brand }: { brand?: Brand }) {
  const document = useEditorStore((s) => s.document);
  const selectedId = useEditorStore((s) => s.selectedId);
  const change = useEditorStore((s) => s.change);
  const select = useEditorStore((s) => s.select);

  if (!document) return null;
  const full = document.layers.length >= MAX_LAYERS;

  const add = (make: (d: TemplateDocument) => Layer) => {
    const layer = make(document);
    change((d) => addLayer(d, layer));
    select(layer.id);
  };

  return (
    <section aria-label="Capas" className="flex min-h-0 flex-col">
      <div className="space-y-2 border-b border-border p-3">
        <h2 className="text-sm font-medium">Añadir capa</h2>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={full}
            onClick={() => add((d) => makeTextLayer(d, brand))}
          >
            <Type className="size-4" />
            Texto
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={full}
            onClick={() => add((d) => makeImageLayer(d))}
          >
            <ImageIcon className="size-4" />
            Imagen
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={full}
            onClick={() => add((d) => makeShapeLayer(d, brand))}
          >
            <Shapes className="size-4" />
            Forma
          </Button>
        </div>
        {full && (
          <p className="text-xs text-muted-foreground">
            Límite de {MAX_LAYERS} capas alcanzado.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-3 pt-3">
        <h2 className="text-sm font-medium">Capas</h2>
        <span className="text-xs text-muted-foreground">
          {document.layers.length}/{MAX_LAYERS}
        </span>
      </div>

      {document.layers.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">
          Aún no hay capas. Añade texto, una imagen o una forma.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {[...document.layers].reverse().map((layer, i, arr) => {
            const Icon = ICONS[layer.type];
            const isTop = i === 0;
            const isBottom = i === arr.length - 1;
            return (
              <li
                key={layer.id}
                className={cn(
                  'flex items-center gap-1 rounded-lg border border-transparent px-1.5 py-1',
                  layer.id === selectedId
                    ? 'border-primary/40 bg-primary/10'
                    : 'hover:bg-muted/60',
                )}
              >
                <button
                  type="button"
                  onClick={() => select(layer.id)}
                  aria-pressed={layer.id === selectedId}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{layer.name}</span>
                  {layer.bind && (
                    <span className="shrink-0 rounded bg-primary/10 px-1 text-[10px] text-primary">
                      {layer.bind.fieldKey}
                    </span>
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={
                    layer.locked ? 'Desbloquear capa' : 'Bloquear capa'
                  }
                  onClick={() =>
                    change((d) =>
                      updateLayer(d, layer.id, { locked: !layer.locked }),
                    )
                  }
                >
                  {layer.locked ? (
                    <Lock className="size-3.5" />
                  ) : (
                    <LockOpen className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Subir capa"
                  disabled={isTop}
                  onClick={() => change((d) => reorderLayer(d, layer.id, 'up'))}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Bajar capa"
                  disabled={isBottom}
                  onClick={() =>
                    change((d) => reorderLayer(d, layer.id, 'down'))
                  }
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Eliminar capa"
                  onClick={() => {
                    change((d) => removeLayer(d, layer.id));
                    if (layer.id === selectedId) select(null);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
