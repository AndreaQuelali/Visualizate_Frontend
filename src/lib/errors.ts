interface ApiErrorShape {
  response?: {
    data?: { message?: string | string[]; errors?: string[] };
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
    return data.errors.join('. ');
  }
  if (Array.isArray(data.message)) return data.message.join('. ');
  return data.message || fallback;
}
