import {
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { ImageIcon } from 'lucide-react';
import type { Brand } from '@/features/brand/api/brand.api';
import type {
  ImageLayer,
  Layer,
  ShapeLayer,
  TemplateDocument,
  TextLayer,
} from '../types/document';
import {
  boundValue,
  resolveColor,
  resolveFontFamily,
  type FieldValues,
} from './resolve';

export interface TemplateCanvasProps {
  document: TemplateDocument;
  /** Field values; when omitted the layers show their own placeholder content. */
  data?: FieldValues;
  brand?: Brand;
  /** assetId -> signed URL */
  assetUrls?: Record<string, string>;
  scale?: number;
  onTextOverflow?: (layerId: string, overflow: boolean) => void;
  /** Extra DOM props per layer (used by the editor for pointer handlers). */
  layerProps?: (layer: Layer) => HTMLAttributes<HTMLDivElement>;
  /** Overlay drawn in canvas coordinates, above the layers, not clipped. */
  overlay?: ReactNode;
  className?: string;
}

function TextLayerView({
  layer,
  data,
  brand,
  onOverflow,
}: {
  layer: TextLayer;
  data?: FieldValues;
  brand?: Brand;
  onOverflow?: (layerId: string, overflow: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bound = boundValue(layer, data);
  const text = bound ?? layer.text;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !onOverflow) return;
    onOverflow(layer.id, el.scrollHeight > el.clientHeight + 1);
  });

  return (
    <div
      ref={ref}
      className="size-full overflow-hidden"
      style={{
        color: resolveColor(layer.color, brand),
        fontFamily: resolveFontFamily(layer.fontRef, brand),
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight ?? 400,
        lineHeight: layer.lineHeight ?? 1.2,
        textAlign: layer.align ?? 'left',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}
    >
      {text}
    </div>
  );
}

function ImageLayerView({
  layer,
  data,
  assetUrls,
}: {
  layer: ImageLayer;
  data?: FieldValues;
  assetUrls?: Record<string, string>;
}) {
  const bound = boundValue(layer, data);
  const assetId = layer.bind ? bound : layer.assetId;
  const src = assetId ? assetUrls?.[assetId] : undefined;

  if (!src) {
    return (
      <div className="flex size-full items-center justify-center border border-dashed border-neutral-400 bg-neutral-200/60 text-neutral-500">
        <ImageIcon className="size-1/4 max-h-16 max-w-16" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className="size-full"
      style={{ objectFit: layer.fit }}
    />
  );
}

function ShapeLayerView({
  layer,
  brand,
}: {
  layer: ShapeLayer;
  brand?: Brand;
}) {
  return (
    <div
      className="size-full"
      style={{
        backgroundColor: resolveColor(layer.fill, brand),
        borderRadius: layer.shape === 'ellipse' ? '50%' : (layer.radius ?? 0),
      }}
    />
  );
}

/**
 * Renders a TemplateDocument with absolutely positioned layers.
 * The same CSS semantics are used by the backend renderer (spec 03), so the
 * editor, the live preview and the exported file stay faithful to each other.
 */
export default function TemplateCanvas({
  document: doc,
  data,
  brand,
  assetUrls,
  scale = 1,
  onTextOverflow,
  layerProps,
  overlay,
  className,
}: TemplateCanvasProps) {
  const { width, height } = doc.canvas;
  const scaled = {
    width: width * scale,
    height: height * scale,
  };
  const space = {
    width,
    height,
    transform: `scale(${scale})`,
    transformOrigin: '0 0',
  } as const;

  return (
    <div className={className} style={{ ...scaled, position: 'relative' }}>
      <div
        className="absolute left-0 top-0 overflow-hidden shadow-md"
        style={{
          ...space,
          backgroundColor: resolveColor(doc.canvas.background, brand),
        }}
        data-testid="template-canvas"
      >
        {doc.layers.map((layer) => {
          const extra = layerProps?.(layer) ?? {};
          return (
            <div
              key={layer.id}
              {...extra}
              data-layer-id={layer.id}
              style={{
                position: 'absolute',
                left: layer.x,
                top: layer.y,
                width: layer.width,
                height: layer.height,
                transform: layer.rotation
                  ? `rotate(${layer.rotation}deg)`
                  : undefined,
                opacity: layer.opacity ?? 1,
                ...extra.style,
              }}
            >
              {layer.type === 'text' && (
                <TextLayerView
                  layer={layer}
                  data={data}
                  brand={brand}
                  onOverflow={onTextOverflow}
                />
              )}
              {layer.type === 'image' && (
                <ImageLayerView
                  layer={layer}
                  data={data}
                  assetUrls={assetUrls}
                />
              )}
              {layer.type === 'shape' && (
                <ShapeLayerView layer={layer} brand={brand} />
              )}
            </div>
          );
        })}
      </div>
      {overlay && (
        <div
          className="pointer-events-none absolute left-0 top-0"
          style={space}
        >
          {overlay}
        </div>
      )}
    </div>
  );
}
