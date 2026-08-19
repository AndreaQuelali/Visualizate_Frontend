import type { Brand } from '@/features/brand/api/brand.api';
import type { ColorRef, FontRef, Layer } from '../types/document';

export type FieldValues = Record<string, string>;

const FALLBACK_COLOR = '#000000';
/** CSS generic families must not be quoted. */
const GENERIC_FAMILIES = new Set(['sans-serif', 'serif', 'monospace']);

export function resolveColor(ref: ColorRef, brand?: Brand): string {
  if ('hex' in ref) return ref.hex;
  return (
    brand?.colors.find((c) => c.id === ref.brandColorId)?.hex ?? FALLBACK_COLOR
  );
}

export function resolveFontFamily(ref: FontRef, brand?: Brand): string {
  const family =
    'family' in ref
      ? ref.family
      : brand?.fonts.find((f) => f.id === ref.brandFontId)?.family;
  if (!family) return 'sans-serif';
  if (GENERIC_FAMILIES.has(family)) return family;
  return `"${family}", sans-serif`;
}

/** The bound field value for a layer, or undefined when it is not bound. */
export function boundValue(
  layer: Layer,
  data: FieldValues | undefined,
): string | undefined {
  if (!layer.bind || !data) return undefined;
  return data[layer.bind.fieldKey] ?? '';
}
