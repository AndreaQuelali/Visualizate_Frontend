/**
 * Parses a comma-separated list of font weights ("400, 700") into numbers.
 * Returns null when the input is not a valid list of weights in 100..900.
 */
export function parseWeights(input: string): number[] | null {
  const parts = input
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p !== '');
  if (parts.length === 0 || parts.length > 9) return null;
  const weights = parts.map((p) => (/^\d+$/.test(p) ? Number(p) : NaN));
  if (weights.some((w) => !Number.isInteger(w) || w < 100 || w > 900)) {
    return null;
  }
  return [...new Set(weights)].sort((a, b) => a - b);
}
