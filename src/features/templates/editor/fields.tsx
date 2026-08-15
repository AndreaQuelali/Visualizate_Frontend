import { useState } from 'react';
import type { Brand } from '@/features/brand/api/brand.api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ColorRef } from '../types/document';

export const selectClass =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

/** Numeric input that tolerates intermediate text ("-", "") while typing. */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
}: NumberFieldProps) {
  const [text, setText] = useState(String(value));
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    if (Number(text) !== value) setText(String(value));
  }

  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        className="h-8"
        value={text}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value.trim() === '' || !Number.isFinite(n)) return;
          const clamped = Math.min(
            max ?? Number.POSITIVE_INFINITY,
            Math.max(min ?? Number.NEGATIVE_INFINITY, n),
          );
          onChange(clamped);
        }}
        onBlur={() => setText(String(value))}
      />
    </label>
  );
}

interface ColorFieldProps {
  label: string;
  value: ColorRef;
  brand?: Brand;
  onChange: (value: ColorRef) => void;
}

/** Picks a brand color (preferred) or a custom hex. */
export function ColorField({ label, value, brand, onChange }: ColorFieldProps) {
  const colors = brand?.colors ?? [];
  const isBrand = 'brandColorId' in value;
  const brandMatch = isBrand && colors.some((c) => c.id === value.brandColorId);
  const selectValue = isBrand
    ? brandMatch
      ? `brand:${value.brandColorId}`
      : 'missing'
    : 'custom';
  const hex = 'hex' in value ? value.hex : '#000000';

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <select
          aria-label={label}
          className={cn(selectClass, 'min-w-0 flex-1')}
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'custom') onChange({ hex });
            else if (v.startsWith('brand:')) {
              onChange({ brandColorId: v.slice(6) });
            }
          }}
        >
          {colors.map((c) => (
            <option key={c.id} value={`brand:${c.id}`}>
              {c.name} ({c.hex})
            </option>
          ))}
          {selectValue === 'missing' && (
            <option value="missing" disabled>
              Color de marca eliminado
            </option>
          )}
          <option value="custom">Personalizado (fuera de marca)</option>
        </select>
        {'hex' in value && (
          <input
            type="color"
            aria-label={`${label}: selector`}
            value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000'}
            onChange={(e) => onChange({ hex: e.target.value })}
            className="size-8 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
          />
        )}
      </div>
    </div>
  );
}
