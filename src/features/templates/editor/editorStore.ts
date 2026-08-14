import { create } from 'zustand';
import type { TemplateDocument } from '../types/document';

export const HISTORY_LIMIT = 50;
const COALESCE_MS = 800;

interface EditorState {
  /** Identifier of what is loaded (template id), to avoid showing stale data. */
  key: string | null;
  document: TemplateDocument | null;
  selectedId: string | null;
  past: TemplateDocument[];
  future: TemplateDocument[];
  dirty: boolean;
  lastKey: string | null;
  lastAt: number;

  load: (doc: TemplateDocument, key?: string) => void;
  reset: () => void;
  select: (id: string | null) => void;
  /** Push the current document to the undo stack (start of a gesture). */
  checkpoint: () => void;
  /** Apply a change without touching history (during a gesture). */
  mutate: (fn: (doc: TemplateDocument) => TemplateDocument) => void;
  /**
   * Apply a change recording history. Consecutive changes with the same
   * `coalesceKey` within a short window share one undo step.
   */
  change: (
    fn: (doc: TemplateDocument) => TemplateDocument,
    coalesceKey?: string,
  ) => void;
  undo: () => void;
  redo: () => void;
  /** Mark as saved only if nothing changed while the request was in flight. */
  markSaved: (saved: TemplateDocument) => void;
}

const pushPast = (past: TemplateDocument[], doc: TemplateDocument) =>
  [...past, doc].slice(-HISTORY_LIMIT);

export const useEditorStore = create<EditorState>((set, get) => ({
  key: null,
  document: null,
  selectedId: null,
  past: [],
  future: [],
  dirty: false,
  lastKey: null,
  lastAt: 0,

  load: (doc, key) =>
    set({
      key: key ?? null,
      document: doc,
      selectedId: null,
      past: [],
      future: [],
      dirty: false,
      lastKey: null,
    }),

  reset: () =>
    set({
      document: null,
      selectedId: null,
      past: [],
      future: [],
      dirty: false,
      lastKey: null,
    }),

  select: (id) => set({ selectedId: id }),

  checkpoint: () => {
    const { document, past } = get();
    if (!document) return;
    set({ past: pushPast(past, document), future: [], lastKey: null });
  },

  mutate: (fn) => {
    const { document } = get();
    if (!document) return;
    const next = fn(document);
    if (next === document) return;
    set({ document: next, dirty: true });
  },

  change: (fn, coalesceKey) => {
    const { document, past, lastKey, lastAt } = get();
    if (!document) return;
    const next = fn(document);
    if (next === document) return;
    const now = Date.now();
    const coalesce =
      !!coalesceKey && coalesceKey === lastKey && now - lastAt < COALESCE_MS;
    set({
      document: next,
      past: coalesce ? past : pushPast(past, document),
      future: [],
      dirty: true,
      lastKey: coalesceKey ?? null,
      lastAt: now,
    });
  },

  undo: () => {
    const { document, past, future } = get();
    if (!document || past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      document: previous,
      past: past.slice(0, -1),
      future: [document, ...future].slice(0, HISTORY_LIMIT),
      dirty: true,
      lastKey: null,
    });
  },

  redo: () => {
    const { document, past, future } = get();
    if (!document || future.length === 0) return;
    const [next, ...rest] = future;
    set({
      document: next,
      past: pushPast(past, document),
      future: rest,
      dirty: true,
      lastKey: null,
    });
  },

  markSaved: (saved) => {
    if (get().document === saved) set({ dirty: false });
  },
}));
