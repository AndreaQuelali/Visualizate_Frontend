import { describe, it, expect } from 'vitest';
import {
  createBlankDocument,
  type TemplateDocument,
} from '@/features/templates/types/document';
import { applyOverrides } from '@/features/pieces/overrides';
import { applyPatchPreview, describePatch } from './preview';

const doc: TemplateDocument = {
  ...createBlankDocument(),
  layers: [
    {
      id: 't',
      type: 'text',
      name: 'Título',
      x: 10,
      y: 10,
      width: 300,
      height: 80,
      text: 'x',
      fontRef: { family: 'serif' },
      fontSize: 20,
      color: { hex: '#000000' },
    },
    {
      id: 's',
      type: 'shape',
      name: 'Caja',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      shape: 'rect',
      fill: { hex: '#ffffff' },
    },
  ],
};

describe('applyOverrides', () => {
  it('merges allowed props without touching the template', () => {
    const out = applyOverrides(doc, { t: { fontSize: 36, x: 40 } });
    expect(out.layers[0]).toMatchObject({ fontSize: 36, x: 40 });
    expect(doc.layers[0]).toMatchObject({ fontSize: 20, x: 10 });
  });

  it('ignores props a layer type does not have and unknown layers', () => {
    const out = applyOverrides(doc, {
      s: { fontSize: 99, x: 7 },
      ghost: { x: 1 },
    });
    expect(out.layers[1]).toMatchObject({ x: 7 });
    expect(out.layers[1]).not.toHaveProperty('fontSize');
  });

  it('returns the same document when there is nothing to apply', () => {
    expect(applyOverrides(doc, {})).toBe(doc);
    expect(applyOverrides(doc, null)).toBe(doc);
  });
});

describe('applyPatchPreview', () => {
  it('previews a layer patch without mutating the document', () => {
    const out = applyPatchPreview(
      doc,
      { a: '1' },
      { kind: 'layer_prop', layerId: 't', prop: 'fontSize', from: 20, to: 44 },
    );
    expect(out.doc.layers[0]).toMatchObject({ fontSize: 44 });
    expect(doc.layers[0]).toMatchObject({ fontSize: 20 });
    expect(out.data).toEqual({ a: '1' });
  });

  it('previews a data patch', () => {
    const data = { titulo: 'Conciero' };
    const out = applyPatchPreview(doc, data, {
      kind: 'piece_data',
      fieldKey: 'titulo',
      from: 'Conciero',
      to: 'Concierto',
    });
    expect(out.data).toEqual({ titulo: 'Concierto' });
    expect(data.titulo).toBe('Conciero');
  });
});

describe('describePatch', () => {
  it('describes text, numeric and color changes', () => {
    expect(
      describePatch({
        kind: 'piece_data',
        fieldKey: 'titulo',
        from: 'Conciero',
        to: 'Concierto',
      }),
    ).toBe('Conciero → Concierto');
    expect(
      describePatch({
        kind: 'layer_prop',
        layerId: 't',
        prop: 'fontSize',
        from: 20,
        to: 44,
      }),
    ).toBe('Tamaño: 20 → 44');
    expect(
      describePatch({
        kind: 'layer_prop',
        layerId: 't',
        prop: 'color',
        from: { hex: '#bbbbbb' },
        to: { brandColorId: 'c1' },
      }),
    ).toBe('Color: #bbbbbb → color de marca');
  });
});
