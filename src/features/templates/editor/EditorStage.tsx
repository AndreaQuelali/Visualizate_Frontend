import { useState } from 'react';
import type { Brand } from '@/features/brand/api/brand.api';
import TemplateCanvas from '../canvas/TemplateCanvas';
import type { Layer } from '../types/document';
import { updateLayer } from './documentOps';
import { useEditorStore } from './editorStore';
import { snapMove, type Guide } from './snap';

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const MIN_SIZE = 10;

const handlePos: Record<Handle, { left: string; top: string; cursor: string }> =
  {
    nw: { left: '0%', top: '0%', cursor: 'nwse-resize' },
    n: { left: '50%', top: '0%', cursor: 'ns-resize' },
    ne: { left: '100%', top: '0%', cursor: 'nesw-resize' },
    e: { left: '100%', top: '50%', cursor: 'ew-resize' },
    se: { left: '100%', top: '100%', cursor: 'nwse-resize' },
    s: { left: '50%', top: '100%', cursor: 'ns-resize' },
    sw: { left: '0%', top: '100%', cursor: 'nesw-resize' },
    w: { left: '0%', top: '50%', cursor: 'ew-resize' },
  };

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EditorStageProps {
  scale: number;
  brand?: Brand;
  assetUrls: Record<string, string>;
}

export default function EditorStage({
  scale,
  brand,
  assetUrls,
}: EditorStageProps) {
  const document = useEditorStore((s) => s.document);
  const selectedId = useEditorStore((s) => s.selectedId);
  const select = useEditorStore((s) => s.select);
  const [guides, setGuides] = useState<Guide[]>([]);

  if (!document) return null;
  const selected = document.layers.find((l) => l.id === selectedId) ?? null;

  const beginDrag = (
    e: React.PointerEvent,
    layer: Layer,
    kind: 'move' | Handle,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const store = useEditorStore.getState();
    store.select(layer.id);
    if (layer.locked) return;
    store.checkpoint();

    const startX = e.clientX;
    const startY = e.clientY;
    const orig: Rect = {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    };

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      const doc = useEditorStore.getState().document;
      if (!doc) return;

      if (kind === 'move') {
        let x = orig.x + dx;
        let y = orig.y + dy;
        let g: Guide[] = [];
        if (!ev.altKey) {
          const others = doc.layers
            .filter((l) => l.id !== layer.id)
            .map((l) => ({ x: l.x, y: l.y, width: l.width, height: l.height }));
          const s = snapMove({ ...orig, x, y }, others, doc.canvas);
          x = s.x;
          y = s.y;
          g = s.guides;
        }
        setGuides(g);
        useEditorStore
          .getState()
          .mutate((d) =>
            updateLayer(d, layer.id, { x: Math.round(x), y: Math.round(y) }),
          );
        return;
      }

      let { x, y, width, height } = orig;
      if (kind.includes('e')) width = orig.width + dx;
      if (kind.includes('s')) height = orig.height + dy;
      if (kind.includes('w')) {
        width = orig.width - dx;
        x = orig.x + dx;
      }
      if (kind.includes('n')) {
        height = orig.height - dy;
        y = orig.y + dy;
      }
      if (width < MIN_SIZE) {
        if (kind.includes('w')) x = orig.x + orig.width - MIN_SIZE;
        width = MIN_SIZE;
      }
      if (height < MIN_SIZE) {
        if (kind.includes('n')) y = orig.y + orig.height - MIN_SIZE;
        height = MIN_SIZE;
      }
      useEditorStore.getState().mutate((d) =>
        updateLayer(d, layer.id, {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        }),
      );
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setGuides([]);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const px = 1 / scale;
  const overlay = (
    <>
      {guides.map((g) => (
        <div
          key={`${g.axis}-${g.position}`}
          className="absolute bg-fuchsia-500"
          style={
            g.axis === 'x'
              ? { left: g.position - px / 2, top: 0, width: px, height: '100%' }
              : { top: g.position - px / 2, left: 0, height: px, width: '100%' }
          }
        />
      ))}
      {selected && (
        <div
          className="absolute"
          style={{
            left: selected.x,
            top: selected.y,
            width: selected.width,
            height: selected.height,
            transform: selected.rotation
              ? `rotate(${selected.rotation}deg)`
              : undefined,
            outline: `${2 * px}px solid ${selected.locked ? '#a3a3a3' : '#4648d4'}`,
          }}
        >
          {!selected.locked &&
            HANDLES.map((h) => (
              <div
                key={h}
                data-handle={h}
                role="presentation"
                onPointerDown={(e) => beginDrag(e, selected, h)}
                className="pointer-events-auto absolute rounded-sm border border-[#4648d4] bg-white"
                style={{
                  left: handlePos[h].left,
                  top: handlePos[h].top,
                  width: 10 * px,
                  height: 10 * px,
                  transform: 'translate(-50%, -50%)',
                  cursor: handlePos[h].cursor,
                }}
              />
            ))}
        </div>
      )}
    </>
  );

  return (
    <div
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-layer-id],[data-handle]')) select(null);
      }}
      className="inline-block"
    >
      <TemplateCanvas
        document={document}
        brand={brand}
        assetUrls={assetUrls}
        scale={scale}
        overlay={overlay}
        layerProps={(layer) => ({
          onPointerDown: (e) => beginDrag(e, layer, 'move'),
          style: { cursor: layer.locked ? 'default' : 'move' },
        })}
      />
    </div>
  );
}
