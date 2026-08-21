import { describe, it, expect } from 'vitest';
import { formatBytes, timeAgo, usagePercent } from './format';

describe('timeAgo', () => {
  const now = new Date('2026-11-20T12:00:00Z').getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it.each([
    [10_000, 'justo ahora'],
    [5 * 60_000, 'hace 5 min'],
    [3 * 3_600_000, 'hace 3 h'],
    [2 * 86_400_000, 'hace 2 d'],
  ])('%i ms atrás → %s', (ms, expected) => {
    expect(timeAgo(ago(ms), now)).toBe(expected);
  });

  it('devuelve vacío con una fecha inválida', () => {
    expect(timeAgo('no-es-fecha', now)).toBe('');
  });
});

describe('formatBytes', () => {
  it.each([
    [512, '512 B'],
    [2048, '2 KB'],
    [5 * 1024 * 1024, '5.0 MB'],
    [3 * 1024 * 1024 * 1024, '3.0 GB'],
  ])('%i → %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe('usagePercent', () => {
  it('calcula el porcentaje y lo limita a 0–100', () => {
    expect(usagePercent(8, 10)).toBe(80);
    expect(usagePercent(15, 10)).toBe(100);
    expect(usagePercent(0, 10)).toBe(0);
  });

  it('no divide entre cero', () => {
    expect(usagePercent(5, 0)).toBe(0);
  });
});
