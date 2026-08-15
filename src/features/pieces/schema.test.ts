import { describe, it, expect } from 'vitest';
import type { FieldDef } from '@/features/templates/types/document';
import { buildPieceSchema, toFormValues } from './schema';

const fields: FieldDef[] = [
  {
    key: 'titulo',
    label: 'Título',
    type: 'text',
    required: true,
    maxLength: 5,
  },
  { key: 'fecha', label: 'Fecha', type: 'date', required: false },
  {
    key: 'tipo',
    label: 'Tipo',
    type: 'select',
    required: false,
    options: ['A', 'B'],
  },
  { key: 'color', label: 'Color', type: 'color', required: false },
];

const messages = (values: Record<string, string>, requireAll: boolean) => {
  const r = buildPieceSchema(fields, requireAll).safeParse(values);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe('buildPieceSchema', () => {
  const empty = { titulo: '', fecha: '', tipo: '', color: '' };

  it('lets drafts keep required fields empty', () => {
    expect(messages(empty, false)).toEqual([]);
  });

  it('requires mandatory fields when marking as ready', () => {
    expect(messages(empty, true)).toEqual(['Título es obligatorio']);
  });

  it('validates length, date, option and color per field type', () => {
    expect(
      messages(
        { titulo: 'demasiado', fecha: '12/05', tipo: 'Z', color: 'rojo' },
        false,
      ),
    ).toEqual([
      'Título no puede superar 5 caracteres',
      'Fecha debe ser una fecha válida',
      'Tipo: elige una de las opciones disponibles',
      'Color debe ser un color #RRGGBB',
    ]);
  });

  it('accepts valid values', () => {
    expect(
      messages(
        { titulo: 'Hola', fecha: '2026-05-12', tipo: 'A', color: '#aabbcc' },
        true,
      ),
    ).toEqual([]);
  });
});

describe('toFormValues', () => {
  it('fills every field, preferring data then defaults then empty', () => {
    const withDefault: FieldDef[] = [
      ...fields,
      {
        key: 'extra',
        label: 'Extra',
        type: 'text',
        required: false,
        defaultValue: 'x',
      },
    ];
    expect(toFormValues(withDefault, { titulo: 'Hola' })).toEqual({
      titulo: 'Hola',
      fecha: '',
      tipo: '',
      color: '',
      extra: 'x',
    });
  });
});
