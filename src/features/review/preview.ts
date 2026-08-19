import type {
  Layer,
  TemplateDocument,
} from '@/features/templates/types/document';
import type { Patch } from './api/review.api';

/**
 * What the piece would look like with a recommendation applied. Used for the
 * before/after preview; nothing is saved.
 */
export function applyPatchPreview(
  doc: TemplateDocument,
  data: Record<string, string>,
  patch: Patch,
): { doc: TemplateDocument; data: Record<string, string> } {
  if (patch.kind === 'piece_data') {
    return { doc, data: { ...data, [patch.fieldKey]: patch.to } };
  }
  return {
    data,
    doc: {
      ...doc,
      layers: doc.layers.map((layer) =>
        layer.id === patch.layerId
          ? ({ ...layer, [patch.prop]: patch.to } as Layer)
          : layer,
      ),
    },
  };
}

/** Short human text for the change ("60 → 80", "Conciero → Concierto"). */
export function describePatch(patch: Patch): string {
  const show = (v: unknown): string => {
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    if (v && typeof v === 'object' && 'hex' in v) {
      return String((v as { hex: string }).hex);
    }
    if (v && typeof v === 'object' && 'brandColorId' in v)
      return 'color de marca';
    return '—';
  };
  if (patch.kind === 'piece_data') {
    return `${show(patch.from) || '(vacío)'} → ${show(patch.to)}`;
  }
  const labels: Record<string, string> = {
    fontSize: 'Tamaño',
    x: 'Posición X',
    y: 'Posición Y',
    width: 'Ancho',
    height: 'Alto',
    color: 'Color',
  };
  return `${labels[patch.prop] ?? patch.prop}: ${show(patch.from)} → ${show(patch.to)}`;
}
