import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import type { Asset } from '@/features/assets/api/assets.api';
import { useUploadAsset } from '@/features/assets/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import type { FieldDef } from '@/features/templates/types/document';
import { maxLengthOf } from '../schema';

const selectClass =
  'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

interface FieldInputProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  workspaceId: string;
  assets: Asset[];
  canUpload: boolean;
  overflow?: boolean;
}

export default function FieldInput({
  field,
  value,
  onChange,
  error,
  workspaceId,
  assets,
  canUpload,
  overflow,
}: FieldInputProps) {
  const id = `field-${field.key}`;
  const max = maxLengthOf(field);
  const upload = useUploadAsset(workspaceId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    try {
      const asset = await upload.mutateAsync({ file });
      onChange(asset.id);
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, 'No se pudo subir la imagen'));
    }
  };

  const images = assets.filter((a) => a.kind === 'IMAGE' || a.kind === 'LOGO');
  const selected = images.find((a) => a.id === value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>
          {field.label}
          {field.required && <span className="text-destructive"> *</span>}
        </Label>
        {max !== undefined && (
          <span
            className={cn(
              'text-xs tabular-nums text-muted-foreground',
              value.length > max && 'text-destructive',
            )}
          >
            {value.length}/{max}
          </span>
        )}
      </div>

      {field.type === 'text' && (
        <Input
          id={id}
          value={value}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.type === 'longtext' && (
        <Textarea
          id={id}
          rows={4}
          value={value}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.type === 'date' && (
        <Input
          id={id}
          type="date"
          value={value}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.type === 'select' && (
        <select
          id={id}
          className={selectClass}
          value={value}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Selecciona…</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
      {field.type === 'color' && (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 cursor-pointer rounded border border-input bg-transparent p-0.5"
            aria-label={field.label}
          />
          <Input
            aria-label={`${field.label} (hex)`}
            value={value}
            placeholder="#RRGGBB"
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
      {field.type === 'image' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              id={id}
              className={selectClass}
              value={value}
              aria-invalid={!!error}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Sin imagen</option>
              {images.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {canUpload && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={onFile}
                  aria-label={`Subir imagen para ${field.label}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Subir imagen"
                  disabled={upload.isPending}
                  onClick={() => fileRef.current?.click()}
                >
                  {upload.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                </Button>
              </>
            )}
          </div>
          {selected && (
            <img
              src={selected.url}
              alt={selected.name}
              className="h-20 rounded-lg border border-border object-contain"
            />
          )}
          {uploadError && (
            <p className="text-xs text-destructive">{uploadError}</p>
          )}
        </div>
      )}

      {overflow && !error && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          El texto no cabe en su recuadro y se verá cortado. Acórtalo.
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
