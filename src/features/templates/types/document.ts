export type ColorRef = { brandColorId: string } | { hex: string };
export type FontRef = { brandFontId: string } | { family: string };

export const FIELD_TYPES = [
  'text',
  'longtext',
  'image',
  'date',
  'select',
  'color',
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: 'Texto corto',
  longtext: 'Texto largo',
  image: 'Imagen',
  date: 'Fecha',
  select: 'Lista de opciones',
  color: 'Color',
};

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  maxLength?: number;
  options?: string[];
  defaultValue?: string;
}

interface BaseLayer {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  bind?: { fieldKey: string };
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontRef: FontRef;
  fontSize: number;
  fontWeight?: number;
  color: ColorRef;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  assetId?: string;
  fit: 'cover' | 'contain';
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: 'rect' | 'ellipse';
  fill: ColorRef;
  radius?: number;
}

export type Layer = TextLayer | ImageLayer | ShapeLayer;

export interface TemplateDocument {
  schemaVersion: 1;
  canvas: { width: number; height: number; unit: 'px'; background: ColorRef };
  fields: FieldDef[];
  layers: Layer[];
}

export const MIN_CANVAS = 100;
export const MAX_CANVAS = 4096;
export const MAX_LAYERS = 100;
export const MAX_FIELDS = 50;

export const CANVAS_PRESETS = [
  { id: 'square', label: 'Cuadrado 1080×1080', width: 1080, height: 1080 },
  { id: 'story', label: 'Historia 1080×1920', width: 1080, height: 1920 },
  { id: 'landscape', label: 'Horizontal 1920×1080', width: 1920, height: 1080 },
  { id: 'a4', label: 'A4 vertical 794×1123', width: 794, height: 1123 },
  { id: 'a4l', label: 'A4 horizontal 1123×794', width: 1123, height: 794 },
] as const;

export function createBlankDocument(): TemplateDocument {
  return {
    schemaVersion: 1,
    canvas: {
      width: 1080,
      height: 1080,
      unit: 'px',
      background: { hex: '#FFFFFF' },
    },
    fields: [],
    layers: [],
  };
}

/** Minimal runtime check used when loading a document from the API. */
export function isTemplateDocument(value: unknown): value is TemplateDocument {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<TemplateDocument>;
  return (
    v.schemaVersion === 1 &&
    typeof v.canvas === 'object' &&
    v.canvas !== null &&
    Array.isArray(v.fields) &&
    Array.isArray(v.layers)
  );
}
