import { describe, it, expect } from 'vitest';
import { parseWeights } from './utils';

describe('parseWeights', () => {
  it('parses, de-duplicates and sorts weights', () => {
    expect(parseWeights('700, 400,400')).toEqual([400, 700]);
  });

  it('rejects empty, non numeric and out of range values', () => {
    expect(parseWeights('')).toBeNull();
    expect(parseWeights('bold')).toBeNull();
    expect(parseWeights('50')).toBeNull();
    expect(parseWeights('400, 1000')).toBeNull();
  });
});
