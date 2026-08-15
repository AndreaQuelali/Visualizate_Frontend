import type { Asset } from '@/features/assets/api/assets.api';
import type { Brand } from '@/features/brand/api/brand.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CANVAS_PRESETS,
  MAX_CANVAS,
  MIN_CANVAS,
  type FontRef,
  type Layer,
} from '../types/document';
import { addField, bindLayer, updateCanvas, updateLayer } from './documentOps';
import { useEditorStore } from './editorStore';
import { ColorField, NumberField, selectClass } from './fields';

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const SYSTEM_FONTS = ['sans-serif', 'serif', 'monospace'];

function fontValue(ref: FontRef): string {
  return 'brandFontId' in ref
    ? `brand:${ref.brandFontId}`
    : `sys:${ref.family}`;
}

interface Props {
  brand?: Brand;
  assets: Asset[];
}

export default function PropertiesPanel({ brand, assets }: Props) {
  const document = useEditorStore((s) => s.document);
  const selectedId = useEditorStore((s) => s.selectedId);
  const change = useEditorStore((s) => s.change);
  if (!document) return null;

  const layer = document.layers.find((l) => l.id === selectedId);

  if (!layer) {
    const c = document.canvas;
    const preset =
      CANVAS_PRESETS.find((p) => p.width === c.width && p.height === c.height)
        ?.id ?? 'custom';
    return (
      <section aria-label="Propiedades del lienzo" className="space-y-3 p-3">
        <h2 className="text-sm font-medium">Lienzo</h2>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tamaño</Label>
          <select
            aria-label="Tamaño predefinido"
            className={selectClass}
            value={preset}
            onChange={(e) => {
              const p = CANVAS_PRESETS.find((x) => x.id === e.target.value);
              if (p) {
                change((d) =>
                  updateCanvas(d, { width: p.width, height: p.height }),
                );
              }
            }}
          >
            {CANVAS_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="custom">Personalizado</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Ancho (px)"
            value={c.width}
            min={MIN_CANVAS}
            max={MAX_CANVAS}
            onChange={(width) =>
              change((d) => updateCanvas(d, { width }), 'canvas:width')
            }
          />
          <NumberField
            label="Alto (px)"
            value={c.height}
            min={MIN_CANVAS}
            max={MAX_CANVAS}
            onChange={(height) =>
              change((d) => updateCanvas(d, { height }), 'canvas:height')
            }
          />
        </div>
        <ColorField
          label="Fondo"
          value={c.background}
          brand={brand}
          onChange={(background) =>
            change((d) => updateCanvas(d, { background }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Selecciona una capa para editar sus propiedades.
        </p>
      </section>
    );
  }

  const set = (patch: Partial<Layer>, key?: string) =>
    change(
      (d) => updateLayer(d, layer.id, patch),
      key ? `${layer.id}:${key}` : undefined,
    );

  const compatible = document.fields.filter((f) =>
    layer.type === 'image'
      ? f.type === 'image'
      : layer.type === 'text'
        ? f.type !== 'image'
        : false,
  );

  const createField = () => {
    const type = layer.type === 'image' ? 'image' : 'text';
    change((d) => {
      const { doc, key } = addField(d, {
        label: layer.name,
        type,
        required: false,
      });
      return key ? bindLayer(doc, layer.id, key) : doc;
    });
  };

  const images = assets.filter((a) => a.kind === 'IMAGE' || a.kind === 'LOGO');

  return (
    <section aria-label="Propiedades de la capa" className="space-y-3 p-3">
      <h2 className="text-sm font-medium">Capa</h2>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Nombre</span>
        <Input
          className="h-8"
          value={layer.name}
          onChange={(e) => set({ name: e.target.value }, 'name')}
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="X"
          value={layer.x}
          onChange={(x) => set({ x }, 'x')}
        />
        <NumberField
          label="Y"
          value={layer.y}
          onChange={(y) => set({ y }, 'y')}
        />
        <NumberField
          label="Ancho"
          value={layer.width}
          min={10}
          onChange={(width) => set({ width }, 'w')}
        />
        <NumberField
          label="Alto"
          value={layer.height}
          min={10}
          onChange={(height) => set({ height }, 'h')}
        />
        <NumberField
          label="Rotación (°)"
          value={layer.rotation ?? 0}
          min={-360}
          max={360}
          onChange={(rotation) => set({ rotation }, 'rot')}
        />
        <NumberField
          label="Opacidad (%)"
          value={Math.round((layer.opacity ?? 1) * 100)}
          min={0}
          max={100}
          onChange={(v) => set({ opacity: v / 100 }, 'op')}
        />
      </div>

      {layer.type === 'text' && (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">
              {layer.bind ? 'Texto de ejemplo' : 'Contenido'}
            </span>
            <Textarea
              rows={3}
              value={layer.text}
              onChange={(e) => set({ text: e.target.value }, 'text')}
            />
          </label>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fuente</Label>
            <select
              aria-label="Fuente"
              className={selectClass}
              value={fontValue(layer.fontRef)}
              onChange={(e) => {
                const v = e.target.value;
                set({
                  fontRef: v.startsWith('brand:')
                    ? { brandFontId: v.slice(6) }
                    : { family: v.slice(4) },
                });
              }}
            >
              {(brand?.fonts ?? []).map((f) => (
                <option key={f.id} value={`brand:${f.id}`}>
                  {f.family} (marca)
                </option>
              ))}
              {SYSTEM_FONTS.map((f) => (
                <option key={f} value={`sys:${f}`}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Tamaño (px)"
              value={layer.fontSize}
              min={1}
              max={1000}
              onChange={(fontSize) => set({ fontSize }, 'fs')}
            />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Peso</Label>
              <select
                aria-label="Peso de la fuente"
                className={selectClass}
                value={layer.fontWeight ?? 400}
                onChange={(e) => set({ fontWeight: Number(e.target.value) })}
              >
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <NumberField
              label="Interlineado"
              value={layer.lineHeight ?? 1.2}
              min={0.5}
              max={5}
              step={0.1}
              onChange={(lineHeight) => set({ lineHeight }, 'lh')}
            />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Alineación
              </Label>
              <select
                aria-label="Alineación"
                className={selectClass}
                value={layer.align ?? 'left'}
                onChange={(e) =>
                  set({ align: e.target.value as 'left' | 'center' | 'right' })
                }
              >
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </div>
          <ColorField
            label="Color del texto"
            value={layer.color}
            brand={brand}
            onChange={(color) => set({ color })}
          />
        </div>
      )}

      {layer.type === 'image' && (
        <div className="space-y-3">
          {!layer.bind && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Imagen</Label>
              <select
                aria-label="Imagen"
                className={selectClass}
                value={layer.assetId ?? ''}
                onChange={(e) => set({ assetId: e.target.value || undefined })}
              >
                <option value="">Sin imagen</option>
                {images.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ajuste</Label>
            <select
              aria-label="Ajuste de la imagen"
              className={selectClass}
              value={layer.fit}
              onChange={(e) =>
                set({ fit: e.target.value as 'cover' | 'contain' })
              }
            >
              <option value="cover">Cubrir</option>
              <option value="contain">Contener</option>
            </select>
          </div>
        </div>
      )}

      {layer.type === 'shape' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Forma</Label>
            <select
              aria-label="Forma"
              className={selectClass}
              value={layer.shape}
              onChange={(e) =>
                set({ shape: e.target.value as 'rect' | 'ellipse' })
              }
            >
              <option value="rect">Rectángulo</option>
              <option value="ellipse">Elipse</option>
            </select>
          </div>
          {layer.shape === 'rect' && (
            <NumberField
              label="Radio de esquina"
              value={layer.radius ?? 0}
              min={0}
              onChange={(radius) => set({ radius }, 'radius')}
            />
          )}
          <ColorField
            label="Relleno"
            value={layer.fill}
            brand={brand}
            onChange={(fill) => set({ fill })}
          />
        </div>
      )}

      {layer.type !== 'shape' && (
        <div className="space-y-2 rounded-lg border border-border p-2">
          <Label className="text-xs text-muted-foreground">
            Campo del formulario
          </Label>
          <select
            aria-label="Campo vinculado"
            className={selectClass}
            value={layer.bind?.fieldKey ?? ''}
            onChange={(e) =>
              change((d) => bindLayer(d, layer.id, e.target.value || null))
            }
          >
            <option value="">Sin vincular (contenido fijo)</option>
            {compatible.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label} ({f.key})
              </option>
            ))}
          </select>
          {!layer.bind && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={createField}
            >
              Crear campo desde esta capa
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
