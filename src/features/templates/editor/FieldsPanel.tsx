import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FIELD_TYPES,
  FIELD_TYPE_LABEL,
  MAX_FIELDS,
  type FieldDef,
  type FieldType,
} from '../types/document';
import { addField, removeField, updateField } from './documentOps';
import { useEditorStore } from './editorStore';
import { selectClass } from './fields';

const KEY_RE = /^[a-z][a-z0-9_]{0,49}$/;

function KeyInput({
  field,
  taken,
  onRename,
}: {
  field: FieldDef;
  taken: Set<string>;
  onRename: (key: string) => void;
}) {
  const [text, setText] = useState(field.key);
  const [prev, setPrev] = useState(field.key);
  if (field.key !== prev) {
    setPrev(field.key);
    setText(field.key);
  }
  const invalid = text !== field.key && (!KEY_RE.test(text) || taken.has(text));

  return (
    <div>
      <Input
        className="h-8 font-mono text-xs"
        aria-label="Clave del campo"
        value={text}
        aria-invalid={invalid}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          if (text !== field.key && !invalid) onRename(text);
          else setText(field.key);
        }}
      />
      {invalid && (
        <p className="mt-1 text-xs text-destructive">
          Usa snake_case único (ej. titulo_evento)
        </p>
      )}
    </div>
  );
}

export default function FieldsPanel() {
  const document = useEditorStore((s) => s.document);
  const change = useEditorStore((s) => s.change);
  if (!document) return null;

  const allKeys = new Set(document.fields.map((f) => f.key));

  return (
    <section aria-label="Campos del formulario" className="space-y-3 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Campos</h2>
        <Button
          size="sm"
          variant="outline"
          disabled={document.fields.length >= MAX_FIELDS}
          onClick={() =>
            change(
              (d) =>
                addField(d, {
                  label: 'Nuevo campo',
                  type: 'text',
                  required: false,
                }).doc,
            )
          }
        >
          <Plus className="size-4" />
          Campo
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Los campos son lo que rellena quien crea una pieza. Vincula cada capa a
        un campo desde sus propiedades.
      </p>

      {document.fields.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          Aún no hay campos.
        </p>
      )}

      <ul className="space-y-3">
        {document.fields.map((f) => {
          const set = (patch: Partial<FieldDef>) =>
            change(
              (d) => updateField(d, f.key, patch),
              `field:${f.key}:${Object.keys(patch).join(',')}`,
            );
          const textual = f.type === 'text' || f.type === 'longtext';
          return (
            <li
              key={f.key}
              className="space-y-2 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-start gap-2">
                <Input
                  className="h-8"
                  aria-label="Etiqueta del campo"
                  value={f.label}
                  onChange={(e) => set({ label: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Eliminar campo ${f.label}`}
                  onClick={() => change((d) => removeField(d, f.key))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <KeyInput
                field={f}
                taken={new Set([...allKeys].filter((k) => k !== f.key))}
                onRename={(key) =>
                  change((d) => updateField(d, f.key, { key }))
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Tipo de campo"
                  className={selectClass}
                  value={f.type}
                  onChange={(e) => {
                    const type = e.target.value as FieldType;
                    set({
                      type,
                      options:
                        type === 'select'
                          ? (f.options ?? ['Opción 1'])
                          : undefined,
                    });
                  }}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {FIELD_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={f.required}
                    onChange={(e) => set({ required: e.target.checked })}
                  />
                  Obligatorio
                </label>
              </div>
              {textual && (
                <Input
                  className="h-8"
                  type="number"
                  min={1}
                  max={5000}
                  placeholder="Máx. caracteres"
                  aria-label="Máximo de caracteres"
                  value={f.maxLength ?? ''}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    set({
                      maxLength:
                        e.target.value === '' || !Number.isFinite(n)
                          ? undefined
                          : Math.min(5000, Math.max(1, Math.round(n))),
                    });
                  }}
                />
              )}
              {f.type === 'select' && (
                <Input
                  className="h-8"
                  aria-label="Opciones separadas por coma"
                  placeholder="Opción 1, Opción 2"
                  value={(f.options ?? []).join(', ')}
                  onChange={(e) =>
                    set({
                      options: e.target.value
                        .split(',')
                        .map((o) => o.trim())
                        .filter(Boolean),
                    })
                  }
                />
              )}
              {(textual || f.type === 'select') && (
                <Input
                  className="h-8"
                  aria-label="Valor por defecto"
                  placeholder="Valor por defecto"
                  value={f.defaultValue ?? ''}
                  onChange={(e) =>
                    set({ defaultValue: e.target.value || undefined })
                  }
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
