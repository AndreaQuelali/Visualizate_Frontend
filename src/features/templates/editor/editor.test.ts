import { describe, it, expect, beforeEach } from 'vitest';
import { createBlankDocument, MAX_LAYERS } from '../types/document';
import {
  addField,
  addLayer,
  bindLayer,
  duplicateLayer,
  makeShapeLayer,
  makeTextLayer,
  removeField,
  removeLayer,
  reorderLayer,
  snakeCase,
  updateField,
  updateLayer,
} from './documentOps';
import { snapMove } from './snap';
import { HISTORY_LIMIT, useEditorStore } from './editorStore';

describe('documentOps', () => {
  it('adds, updates and removes layers immutably', () => {
    const doc = createBlankDocument();
    const text = makeTextLayer(doc);
    const withText = addLayer(doc, text);
    expect(doc.layers).toHaveLength(0);
    expect(withText.layers).toHaveLength(1);

    const moved = updateLayer(withText, text.id, { x: 10, y: 20 });
    expect(moved.layers[0]).toMatchObject({ x: 10, y: 20 });
    expect(withText.layers[0].x).not.toBe(10);

    expect(removeLayer(moved, text.id).layers).toHaveLength(0);
  });

  it('does not exceed the layer limit', () => {
    let doc = createBlankDocument();
    for (let i = 0; i < MAX_LAYERS + 5; i++) {
      doc = addLayer(doc, makeShapeLayer(doc));
    }
    expect(doc.layers).toHaveLength(MAX_LAYERS);
  });

  it('duplicates a layer right above the original, offset and unlocked', () => {
    let doc = createBlankDocument();
    const a = makeShapeLayer(doc);
    doc = addLayer(addLayer(doc, a), makeShapeLayer(doc));
    const { doc: next, newId } = duplicateLayer(
      updateLayer(doc, a.id, { locked: true }),
      a.id,
    );
    expect(next.layers).toHaveLength(3);
    expect(next.layers[1].id).toBe(newId);
    expect(next.layers[1]).toMatchObject({ x: a.x + 20, locked: false });
  });

  it('reorders layers in z-index', () => {
    let doc = createBlankDocument();
    const [a, b, c] = [1, 2, 3].map(() => makeShapeLayer(doc));
    doc = addLayer(addLayer(addLayer(doc, a), b), c);
    expect(reorderLayer(doc, a.id, 'top').layers.map((l) => l.id)).toEqual([
      b.id,
      c.id,
      a.id,
    ]);
    expect(reorderLayer(doc, c.id, 'down').layers.map((l) => l.id)).toEqual([
      a.id,
      c.id,
      b.id,
    ]);
    expect(reorderLayer(doc, c.id, 'up')).toBe(doc);
  });

  it('creates unique snake_case field keys and keeps binds consistent', () => {
    expect(snakeCase('Título del Evento!')).toBe('titulo_del_evento');
    expect(snakeCase('123')).toBe('c_123');

    let doc = createBlankDocument();
    const text = makeTextLayer(doc);
    doc = addLayer(doc, text);
    const first = addField(doc, {
      label: 'Título',
      type: 'text',
      required: true,
    });
    const second = addField(first.doc, {
      label: 'Título',
      type: 'text',
      required: false,
    });
    expect([first.key, second.key]).toEqual(['titulo', 'titulo_2']);

    doc = bindLayer(second.doc, text.id, 'titulo');
    expect(doc.layers[0].bind).toEqual({ fieldKey: 'titulo' });

    doc = updateField(doc, 'titulo', { key: 'nombre' });
    expect(doc.layers[0].bind).toEqual({ fieldKey: 'nombre' });

    doc = removeField(doc, 'nombre');
    expect(doc.fields.map((f) => f.key)).toEqual(['titulo_2']);
    expect(doc.layers[0].bind).toBeUndefined();
  });
});

describe('snapMove', () => {
  const canvas = { width: 1000, height: 1000 };

  it('snaps to the canvas center and reports guides', () => {
    const r = snapMove({ x: 397, y: 100, width: 200, height: 100 }, [], canvas);
    expect(r.x).toBe(400); // center of rect (497+3) -> 500
    expect(r.guides).toContainEqual({ axis: 'x', position: 500 });
  });

  it('snaps to another layer edge and leaves far positions untouched', () => {
    const other = { x: 100, y: 600, width: 100, height: 100 };
    const near = snapMove(
      { x: 203, y: 300, width: 50, height: 50 },
      [other],
      canvas,
    );
    expect(near.x).toBe(200);
    const far = snapMove(
      { x: 333, y: 333, width: 50, height: 50 },
      [other],
      canvas,
    );
    expect(far).toMatchObject({ x: 333, y: 333, guides: [] });
  });
});

describe('editorStore history', () => {
  beforeEach(() => {
    useEditorStore.getState().load(createBlankDocument());
  });

  it('supports undo/redo for changes', () => {
    const { change, undo, redo } = useEditorStore.getState();
    const layer = makeShapeLayer(useEditorStore.getState().document!);
    change((d) => addLayer(d, layer));
    expect(useEditorStore.getState().document!.layers).toHaveLength(1);
    expect(useEditorStore.getState().dirty).toBe(true);

    undo();
    expect(useEditorStore.getState().document!.layers).toHaveLength(0);
    redo();
    expect(useEditorStore.getState().document!.layers).toHaveLength(1);
  });

  it('records a single undo step per gesture (checkpoint + mutate)', () => {
    const store = useEditorStore.getState();
    const layer = makeShapeLayer(store.document!);
    store.change((d) => addLayer(d, layer));

    store.checkpoint();
    for (let x = 1; x <= 20; x++) {
      useEditorStore.getState().mutate((d) => updateLayer(d, layer.id, { x }));
    }
    expect(useEditorStore.getState().document!.layers[0].x).toBe(20);

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document!.layers[0].x).toBe(layer.x);
  });

  it('coalesces rapid changes with the same key into one step', () => {
    const store = useEditorStore.getState();
    const layer = makeShapeLayer(store.document!);
    store.change((d) => addLayer(d, layer));
    const before = useEditorStore.getState().past.length;
    for (let i = 1; i <= 5; i++) {
      useEditorStore
        .getState()
        .change((d) => updateLayer(d, layer.id, { width: 100 + i }), 'w');
    }
    expect(useEditorStore.getState().past.length).toBe(before + 1);
  });

  it('caps history and clears redo after a new change', () => {
    const store = useEditorStore.getState();
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) {
      useEditorStore
        .getState()
        .change((d) => addLayer(d, makeShapeLayer(store.document!)));
    }
    expect(useEditorStore.getState().past.length).toBe(HISTORY_LIMIT);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().future).toHaveLength(1);
    useEditorStore.getState().change((d) => ({ ...d, fields: [] }));
    expect(useEditorStore.getState().future).toHaveLength(0);
  });

  it('markSaved only clears dirty when the saved snapshot is still current', () => {
    const store = useEditorStore.getState();
    store.change((d) => ({ ...d, fields: [] }));
    const snapshot = useEditorStore.getState().document!;
    useEditorStore.getState().change((d) => ({ ...d, fields: [] }));
    useEditorStore.getState().markSaved(snapshot);
    expect(useEditorStore.getState().dirty).toBe(true);
    useEditorStore.getState().markSaved(useEditorStore.getState().document!);
    expect(useEditorStore.getState().dirty).toBe(false);
  });
});
