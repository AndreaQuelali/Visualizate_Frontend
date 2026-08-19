import type {
  Layer,
  TemplateDocument,
} from '@/features/templates/types/document';

/**
 * Per-piece tweaks (applied review recommendations) merged over the template
 * document. Mirrors the backend so preview and exported file agree.
 */
export const OVERRIDE_PROPS = [
  'fontSize',
  'x',
  'y',
  'width',
  'height',
  'color',
] as const;
export type OverrideProp = (typeof OVERRIDE_PROPS)[number];
export type PieceOverrides = Record<
  string,
  Partial<Record<OverrideProp, unknown>>
>;

function allowed(layerType: Layer['type'], prop: OverrideProp): boolean {
  if (prop === 'fontSize' || prop === 'color') return layerType === 'text';
  return true;
}

export function applyOverrides(
  doc: TemplateDocument,
  overrides: PieceOverrides | null | undefined,
): TemplateDocument {
  if (!overrides || Object.keys(overrides).length === 0) return doc;
  return {
    ...doc,
    layers: doc.layers.map((layer) => {
      const o = overrides[layer.id];
      if (!o) return layer;
      const merged: Record<string, unknown> = { ...layer };
      for (const prop of OVERRIDE_PROPS) {
        if (prop in o && allowed(layer.type, prop)) merged[prop] = o[prop];
      }
      return merged as unknown as Layer;
    }),
  };
}
