import { useEffect } from 'react';
import type { Asset } from '@/features/assets/api/assets.api';
import type { Brand } from '../api/brand.api';

const loaded = new Set<string>();

/**
 * Registers the brand's uploaded font files with the browser so canvas text
 * uses the real typeface. Fonts without a file fall back to system fonts.
 */
export function useBrandFonts(brand: Brand | undefined, assets: Asset[]) {
  useEffect(() => {
    if (!brand || typeof FontFace === 'undefined') return;
    for (const font of brand.fonts) {
      if (!font.assetId) continue;
      const asset = assets.find((a) => a.id === font.assetId);
      if (!asset) continue;
      const key = `${font.family}|${asset.id}`;
      if (loaded.has(key)) continue;
      loaded.add(key);
      const face = new FontFace(font.family, `url(${asset.url})`, {
        weight: '100 900',
      });
      face
        .load()
        .then((f) => document.fonts.add(f))
        .catch(() => loaded.delete(key));
    }
  }, [brand, assets]);
}
