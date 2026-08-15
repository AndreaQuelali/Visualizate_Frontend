import type { Brand } from '@/features/brand/api/brand.api';
import {
  MAX_FIELDS,
  MAX_LAYERS,
  type FieldDef,
  type ImageLayer,
  type Layer,
  type ShapeLayer,
  type TemplateDocument,
  type TextLayer,
} from '../types/document';

/** Pure, immutable operations over a TemplateDocument. */

let counter = 0;
export function newLayerId(): string {
  counter += 1;
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `l_${rand}${counter}`;
}

export function snakeCase(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const safe = base || 'campo';
  return /^[a-z]/.test(safe) ? safe.slice(0, 40) : `c_${safe}`.slice(0, 40);
}

export function uniqueFieldKey(fields: FieldDef[], wanted: string): string {
  const keys = new Set(fields.map((f) => f.key));
  const base = snakeCase(wanted);
  if (!keys.has(base)) return base;
  let i = 2;
  while (keys.has(`${base}_${i}`)) i += 1;
  return `${base}_${i}`;
}

// ─── Layer factories ──────────────────────────────────────────────────────────

const center = (doc: TemplateDocument, w: number, h: number) => ({
  x: Math.round((doc.canvas.width - w) / 2),
  y: Math.round((doc.canvas.height - h) / 2),
});

export function makeTextLayer(doc: TemplateDocument, brand?: Brand): TextLayer {
  const w = Math.min(600, doc.canvas.width);
  const h = 120;
  const primary =
    brand?.colors.find((c) => c.role === 'NEUTRAL') ?? brand?.colors[0];
  const font = brand?.fonts[0];
  return {
    id: newLayerId(),
    type: 'text',
    name: 'Texto',
    ...center(doc, w, h),
    width: w,
    height: h,
    text: 'Escribe tu texto',
    fontRef: font?.id ? { brandFontId: font.id } : { family: 'sans-serif' },
    fontSize: 48,
    fontWeight: 700,
    color: primary?.id ? { brandColorId: primary.id } : { hex: '#111111' },
    align: 'left',
    lineHeight: 1.2,
  };
}

export function makeImageLayer(doc: TemplateDocument): ImageLayer {
  const w = Math.min(500, doc.canvas.width);
  const h = Math.min(400, doc.canvas.height);
  return {
    id: newLayerId(),
    type: 'image',
    name: 'Imagen',
    ...center(doc, w, h),
    width: w,
    height: h,
    fit: 'cover',
  };
}

export function makeShapeLayer(
  doc: TemplateDocument,
  brand?: Brand,
): ShapeLayer {
  const w = Math.min(300, doc.canvas.width);
  const h = Math.min(300, doc.canvas.height);
  const accent =
    brand?.colors.find((c) => c.role === 'PRIMARY') ?? brand?.colors[0];
  return {
    id: newLayerId(),
    type: 'shape',
    name: 'Forma',
    ...center(doc, w, h),
    width: w,
    height: h,
    shape: 'rect',
    fill: accent?.id ? { brandColorId: accent.id } : { hex: '#4648d4' },
    radius: 0,
  };
}

// ─── Layers ───────────────────────────────────────────────────────────────────

export function addLayer(
  doc: TemplateDocument,
  layer: Layer,
): TemplateDocument {
  if (doc.layers.length >= MAX_LAYERS) return doc;
  return { ...doc, layers: [...doc.layers, layer] };
}

export function updateLayer(
  doc: TemplateDocument,
  id: string,
  patch: Partial<Layer>,
): TemplateDocument {
  return {
    ...doc,
    layers: doc.layers.map((l) =>
      l.id === id ? ({ ...l, ...patch } as Layer) : l,
    ),
  };
}

export function removeLayer(
  doc: TemplateDocument,
  id: string,
): TemplateDocument {
  return { ...doc, layers: doc.layers.filter((l) => l.id !== id) };
}

export function duplicateLayer(
  doc: TemplateDocument,
  id: string,
): { doc: TemplateDocument; newId: string | null } {
  const source = doc.layers.find((l) => l.id === id);
  if (!source || doc.layers.length >= MAX_LAYERS) {
    return { doc, newId: null };
  }
  const copy: Layer = {
    ...source,
    id: newLayerId(),
    name: `${source.name} copia`,
    x: source.x + 20,
    y: source.y + 20,
    locked: false,
  };
  const index = doc.layers.findIndex((l) => l.id === id);
  const layers = [...doc.layers];
  layers.splice(index + 1, 0, copy);
  return { doc: { ...doc, layers }, newId: copy.id };
}

export type ZMove = 'up' | 'down' | 'top' | 'bottom';

export function reorderLayer(
  doc: TemplateDocument,
  id: string,
  move: ZMove,
): TemplateDocument {
  const from = doc.layers.findIndex((l) => l.id === id);
  if (from === -1) return doc;
  const last = doc.layers.length - 1;
  const to =
    move === 'up'
      ? Math.min(from + 1, last)
      : move === 'down'
        ? Math.max(from - 1, 0)
        : move === 'top'
          ? last
          : 0;
  if (to === from) return doc;
  const layers = [...doc.layers];
  const [item] = layers.splice(from, 1);
  layers.splice(to, 0, item);
  return { ...doc, layers };
}

// ─── Canvas & fields ──────────────────────────────────────────────────────────

export function updateCanvas(
  doc: TemplateDocument,
  patch: Partial<TemplateDocument['canvas']>,
): TemplateDocument {
  return { ...doc, canvas: { ...doc.canvas, ...patch } };
}

export function addField(
  doc: TemplateDocument,
  field: Omit<FieldDef, 'key'> & { key?: string },
): { doc: TemplateDocument; key: string | null } {
  if (doc.fields.length >= MAX_FIELDS) return { doc, key: null };
  const key = uniqueFieldKey(doc.fields, field.key ?? field.label);
  return {
    doc: { ...doc, fields: [...doc.fields, { ...field, key }] },
    key,
  };
}

export function updateField(
  doc: TemplateDocument,
  key: string,
  patch: Partial<FieldDef>,
): TemplateDocument {
  const newKey = patch.key;
  return {
    ...doc,
    fields: doc.fields.map((f) => (f.key === key ? { ...f, ...patch } : f)),
    layers:
      newKey && newKey !== key
        ? doc.layers.map((l) =>
            l.bind?.fieldKey === key
              ? ({ ...l, bind: { fieldKey: newKey } } as Layer)
              : l,
          )
        : doc.layers,
  };
}

/** Removes a field and unbinds the layers that used it. */
export function removeField(
  doc: TemplateDocument,
  key: string,
): TemplateDocument {
  return {
    ...doc,
    fields: doc.fields.filter((f) => f.key !== key),
    layers: doc.layers.map((l) => {
      if (l.bind?.fieldKey !== key) return l;
      const { bind: _bind, ...rest } = l;
      void _bind;
      return rest as Layer;
    }),
  };
}

export function bindLayer(
  doc: TemplateDocument,
  layerId: string,
  fieldKey: string | null,
): TemplateDocument {
  return {
    ...doc,
    layers: doc.layers.map((l) => {
      if (l.id !== layerId) return l;
      if (fieldKey === null) {
        const { bind: _bind, ...rest } = l;
        void _bind;
        return rest as Layer;
      }
      return { ...l, bind: { fieldKey } } as Layer;
    }),
  };
}
