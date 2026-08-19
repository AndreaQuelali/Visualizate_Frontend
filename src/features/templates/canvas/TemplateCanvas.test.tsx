import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TemplateCanvas from './TemplateCanvas';
import { createBlankDocument, type TemplateDocument } from '../types/document';
import type { Brand } from '@/features/brand/api/brand.api';

const brand: Brand = {
  colors: [{ id: 'c1', name: 'Indigo', hex: '#4648d4', role: 'PRIMARY' }],
  fonts: [{ id: 'f1', family: 'Inter', weights: [400] }],
  logoAssetId: null,
  logoUrl: null,
  updatedAt: null,
};

function doc(): TemplateDocument {
  const base = createBlankDocument();
  return {
    ...base,
    fields: [{ key: 'titulo', label: 'Título', type: 'text', required: true }],
    layers: [
      {
        id: 'l1',
        type: 'text',
        name: 'Título',
        x: 10,
        y: 20,
        width: 300,
        height: 80,
        text: 'Texto de ejemplo',
        fontRef: { brandFontId: 'f1' },
        fontSize: 40,
        color: { brandColorId: 'c1' },
        bind: { fieldKey: 'titulo' },
      },
      {
        id: 'l2',
        type: 'text',
        name: 'Fijo',
        x: 0,
        y: 200,
        width: 300,
        height: 40,
        text: 'Siempre igual',
        fontRef: { family: 'serif' },
        fontSize: 20,
        color: { hex: '#111111' },
      },
    ],
  };
}

describe('TemplateCanvas', () => {
  it('shows the placeholder text when there is no data (editor mode)', () => {
    render(<TemplateCanvas document={doc()} brand={brand} />);
    expect(screen.getByText('Texto de ejemplo')).toBeInTheDocument();
    expect(screen.getByText('Siempre igual')).toBeInTheDocument();
  });

  it('replaces bound layers with field values but keeps fixed layers', () => {
    render(
      <TemplateCanvas
        document={doc()}
        brand={brand}
        data={{ titulo: 'Concierto 12 de mayo' }}
      />,
    );
    expect(screen.getByText('Concierto 12 de mayo')).toBeInTheDocument();
    expect(screen.queryByText('Texto de ejemplo')).not.toBeInTheDocument();
    expect(screen.getByText('Siempre igual')).toBeInTheDocument();
  });

  it('resolves brand colors and positions layers absolutely', () => {
    render(<TemplateCanvas document={doc()} brand={brand} scale={0.5} />);
    const text = screen.getByText('Texto de ejemplo');
    expect(text).toHaveStyle({ color: 'rgb(70, 72, 212)', fontSize: '40px' });
    const layer = text.closest('[data-layer-id]') as HTMLElement;
    expect(layer).toHaveStyle({ left: '10px', top: '20px', width: '300px' });
  });

  it('uses generic font families unquoted and brand fonts quoted', () => {
    render(<TemplateCanvas document={doc()} brand={brand} />);
    expect(screen.getByText('Siempre igual').style.fontFamily).toBe('serif');
    expect(screen.getByText('Texto de ejemplo').style.fontFamily).toContain(
      'Inter',
    );
  });

  it('renders bound text literally (no HTML injection)', () => {
    render(
      <TemplateCanvas
        document={doc()}
        brand={brand}
        data={{ titulo: '<img src=x onerror=alert(1)>' }}
      />,
    );
    expect(
      screen.getByText('<img src=x onerror=alert(1)>'),
    ).toBeInTheDocument();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });
});
