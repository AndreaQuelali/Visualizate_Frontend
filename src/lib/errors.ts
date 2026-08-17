interface ApiErrorShape {
  response?: {
    data?: {
      message?: string | string[];
      errors?: Array<string | { field?: string; message?: string }>;
    };
  };
}

/**
 * Extracts a user-facing message from an unknown error thrown by axios.
 * Falls back to `fallback` when the API did not return a message.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape;
  const data = e?.response?.data;
  if (!data) return fallback;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((x) => (typeof x === 'string' ? x : (x.message ?? '')))
      .filter(Boolean)
      .join('. ');
  }
  if (Array.isArray(data.message)) return data.message.join('. ');
  return data.message || fallback;
}

/** Seconds to wait after a 429, when the API says so. */
export function getRetryAfterSeconds(err: unknown): number | undefined {
  const e = err as {
    response?: { data?: { retryAfterSeconds?: number } };
  };
  const n = e?.response?.data?.retryAfterSeconds;
  return typeof n === 'number' ? n : undefined;
}

/** Per-field errors returned by the API (`errors: [{ field, message }]`). */
export function getFieldErrors(err: unknown): Record<string, string> {
  const e = err as ApiErrorShape;
  const out: Record<string, string> = {};
  for (const x of e?.response?.data?.errors ?? []) {
    if (typeof x !== 'string' && x.field && x.message) out[x.field] = x.message;
  }
  return out;
}
