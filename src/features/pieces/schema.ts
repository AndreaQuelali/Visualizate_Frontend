import * as z from 'zod';
import type { FieldDef } from '@/features/templates/types/document';

export const DEFAULT_MAX_TEXT = 200;
export const DEFAULT_MAX_LONGTEXT = 2000;

export function maxLengthOf(field: FieldDef): number | undefined {
  if (field.type === 'text') return field.maxLength ?? DEFAULT_MAX_TEXT;
  if (field.type === 'longtext') {
    return field.maxLength ?? DEFAULT_MAX_LONGTEXT;
  }
  return undefined;
}

/**
 * Builds a Zod schema at runtime from the template fields.
 * `requireAll` also enforces required fields (needed to mark a piece READY).
 * Messages mirror the API so client and server errors read the same.
 */
export function buildPieceSchema(fields: FieldDef[], requireAll: boolean) {
  const shape: Record<string, z.ZodType<string>> = {};
  for (const f of fields) {
    shape[f.key] = z.string().superRefine((value, ctx) => {
      const fail = (message: string) =>
        ctx.addIssue({ code: 'custom', message });

      if (value === '') {
        if (requireAll && f.required) fail(`${f.label} es obligatorio`);
        return;
      }
      const max = maxLengthOf(f);
      if (max !== undefined && value.length > max) {
        fail(`${f.label} no puede superar ${max} caracteres`);
      }
      if (f.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        fail(`${f.label} debe ser una fecha válida`);
      }
      if (f.type === 'select' && !f.options?.includes(value)) {
        fail(`${f.label}: elige una de las opciones disponibles`);
      }
      if (f.type === 'color' && !/^#[0-9a-fA-F]{6}$/.test(value)) {
        fail(`${f.label} debe ser un color #RRGGBB`);
      }
    });
  }
  return z.object(shape);
}

/** Form values for a piece: every field present, empty string when unset. */
export function toFormValues(
  fields: FieldDef[],
  data: Record<string, string>,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of fields) values[f.key] = data[f.key] ?? f.defaultValue ?? '';
  return values;
}
