import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, Loader2, Plus, Trash2 } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useActiveWorkspace } from '@/features/workspace/hooks/useActiveWorkspace';
import { useAssets } from '@/features/assets/hooks/useAssets';
import { useBrand, useUpdateBrand } from '../hooks/useBrand';
import { parseWeights } from '../utils';
import type { Brand } from '../api/brand.api';

const ROLES = [
  { value: 'PRIMARY', label: 'Primario' },
  { value: 'SECONDARY', label: 'Secundario' },
  { value: 'ACCENT', label: 'Acento' },
  { value: 'NEUTRAL', label: 'Neutro' },
] as const;

const schema = z.object({
  colors: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z
          .string()
          .min(1, 'El nombre es requerido')
          .max(60, 'Máximo 60 caracteres'),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Usa el formato #RRGGBB'),
        role: z.enum(['PRIMARY', 'SECONDARY', 'ACCENT', 'NEUTRAL']),
      }),
    )
    .max(24, 'Máximo 24 colores'),
  fonts: z
    .array(
      z.object({
        id: z.string().optional(),
        family: z
          .string()
          .min(1, 'La familia es requerida')
          .max(80, 'Máximo 80 caracteres'),
        weights: z
          .string()
          .refine((v) => parseWeights(v) !== null, 'Ej.: 400, 700 (100–900)'),
        assetId: z.string().optional(),
      }),
    )
    .max(12, 'Máximo 12 fuentes'),
  logoAssetId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(brand: Brand): FormValues {
  return {
    colors: brand.colors.map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
      role: c.role,
    })),
    fonts: brand.fonts.map((f) => ({
      id: f.id,
      family: f.family,
      weights: f.weights.join(', '),
      assetId: f.assetId ?? '',
    })),
    logoAssetId: brand.logoAssetId ?? '',
  };
}

const selectClass =
  'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60';

export default function BrandPage() {
  const { workspaceId, isAdmin, isLoading: wsLoading } = useActiveWorkspace();
  const { data: brand, isLoading, isError, refetch } = useBrand(workspaceId);
  const { data: assets = [] } = useAssets(workspaceId);
  const update = useUpdateBrand(workspaceId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { colors: [], fonts: [], logoAssetId: '' },
  });
  const colorsArray = useFieldArray({ control, name: 'colors' });
  const fontsArray = useFieldArray({ control, name: 'fonts' });
  const colorValues = watch('colors');

  useEffect(() => {
    if (brand) reset(toFormValues(brand));
  }, [brand, reset]);

  if (!wsLoading && !workspaceId) {
    return <Navigate to="/workspaces" replace />;
  }

  const logoAssets = assets.filter(
    (a) => a.kind === 'LOGO' || a.kind === 'IMAGE',
  );
  const fontAssets = assets.filter((a) => a.kind === 'FONT');
  const readOnly = !isAdmin;

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSaved(false);
    try {
      await update.mutateAsync({
        colors: values.colors,
        fonts: values.fonts.map((f) => ({
          id: f.id,
          family: f.family,
          weights: parseWeights(f.weights) ?? [400],
          assetId: f.assetId || undefined,
        })),
        logoAssetId: values.logoAssetId || null,
      });
      setSaved(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo guardar la marca'));
    }
  };

  if (isLoading || wsLoading) {
    return (
      <PageContainer>
        <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo cargar el kit de marca.{' '}
          <button className="underline" onClick={() => void refetch()}>
            Reintentar
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Identidad visual
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
          Marca
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Colores, fuentes y logo que usarán todas las plantillas del espacio.
          {readOnly && ' Solo un administrador puede editarlos.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        {/* Colores */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Paleta de colores</h2>
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={colorsArray.fields.length >= 24}
                onClick={() =>
                  colorsArray.append({
                    name: '',
                    hex: '#4648d4',
                    role: 'PRIMARY',
                  })
                }
              >
                <Plus className="size-4" />
                Añadir color
              </Button>
            )}
          </div>
          {colorsArray.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no hay colores de marca.
            </p>
          )}
          <ul className="space-y-3">
            {colorsArray.fields.map((field, i) => (
              <li
                key={field.id}
                className="grid grid-cols-[auto_1fr_8rem_9rem_auto] items-start gap-2"
              >
                <span
                  className="mt-1 size-7 rounded-md border border-border"
                  style={{ backgroundColor: colorValues?.[i]?.hex }}
                  aria-hidden
                />
                <div>
                  <Input
                    placeholder="Nombre"
                    aria-label="Nombre del color"
                    disabled={readOnly}
                    {...register(`colors.${i}.name`)}
                    aria-invalid={!!errors.colors?.[i]?.name}
                  />
                  {errors.colors?.[i]?.name && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.colors[i]?.name?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="#4648d4"
                    aria-label="Valor hexadecimal"
                    disabled={readOnly}
                    {...register(`colors.${i}.hex`)}
                    aria-invalid={!!errors.colors?.[i]?.hex}
                  />
                  {errors.colors?.[i]?.hex && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.colors[i]?.hex?.message}
                    </p>
                  )}
                </div>
                <select
                  aria-label="Rol del color"
                  className={selectClass}
                  disabled={readOnly}
                  {...register(`colors.${i}.role`)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar color"
                    onClick={() => colorsArray.remove(i)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Fuentes */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Fuentes</h2>
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={fontsArray.fields.length >= 12}
                onClick={() =>
                  fontsArray.append({
                    family: '',
                    weights: '400, 700',
                    assetId: '',
                  })
                }
              >
                <Plus className="size-4" />
                Añadir fuente
              </Button>
            )}
          </div>
          {fontsArray.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no hay fuentes de marca.
            </p>
          )}
          <ul className="space-y-3">
            {fontsArray.fields.map((field, i) => (
              <li
                key={field.id}
                className="grid grid-cols-[1fr_9rem_1fr_auto] items-start gap-2"
              >
                <div>
                  <Input
                    placeholder="Familia (ej. Inter)"
                    aria-label="Familia tipográfica"
                    disabled={readOnly}
                    {...register(`fonts.${i}.family`)}
                    aria-invalid={!!errors.fonts?.[i]?.family}
                  />
                  {errors.fonts?.[i]?.family && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.fonts[i]?.family?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="400, 700"
                    aria-label="Pesos"
                    disabled={readOnly}
                    {...register(`fonts.${i}.weights`)}
                    aria-invalid={!!errors.fonts?.[i]?.weights}
                  />
                  {errors.fonts?.[i]?.weights && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.fonts[i]?.weights?.message}
                    </p>
                  )}
                </div>
                <select
                  aria-label="Archivo de fuente"
                  className={selectClass}
                  disabled={readOnly}
                  {...register(`fonts.${i}.assetId`)}
                >
                  <option value="">Fuente del sistema</option>
                  {fontAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar fuente"
                    onClick={() => fontsArray.remove(i)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Logo */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-medium">Logo</h2>
          <div className="flex items-center gap-4">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
              {brand?.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt="Logo de la marca"
                  className="size-full object-contain p-1"
                />
              ) : (
                <span className="text-xs text-muted-foreground">Sin logo</span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="brand-logo">Asset del logo</Label>
              <select
                id="brand-logo"
                className={cn(selectClass, 'max-w-sm')}
                disabled={readOnly}
                {...register('logoAssetId')}
              >
                <option value="">Sin logo</option>
                {logoAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Sube el archivo en la sección Assets y elígelo aquí.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-lg border-l-4 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {!readOnly && (
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={update.isPending || !isDirty}>
              {update.isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar marca
            </Button>
            {saved && !isDirty && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="size-4" />
                Guardado
              </span>
            )}
          </div>
        )}
      </form>
    </PageContainer>
  );
}
