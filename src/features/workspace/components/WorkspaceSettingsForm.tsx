import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Workspace } from '../api/workspace.api';
import {
  useUpdateWorkspace,
  useUploadWorkspaceLogo,
} from '../hooks/useWorkspaces';
import { useState } from 'react';

const schema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type FormValues = z.infer<typeof schema>;

interface WorkspaceSettingsFormProps {
  workspace: Workspace;
}

export default function WorkspaceSettingsForm({
  workspace,
}: WorkspaceSettingsFormProps) {
  const update = useUpdateWorkspace(workspace.id);
  const uploadLogo = useUploadWorkspaceLogo(workspace.id);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: workspace.name,
      description: workspace.description ?? '',
    });
  }, [workspace, reset]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setMessage(null);
    try {
      await update.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });
      setMessage('Cambios guardados');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'No se pudo guardar');
    }
  };

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await uploadLogo.mutateAsync(file);
      setMessage('Logo actualizado');
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setError(ex.response?.data?.message || 'No se pudo subir el logo');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
      <div className="flex items-center gap-4">
        <label className="relative flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 hover:border-primary/50">
          {workspace.logoUrl ? (
            <img
              src={workspace.logoUrl}
              alt={`Logo de ${workspace.name}`}
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-5 text-muted-foreground" />
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            onChange={onLogoChange}
          />
        </label>
        <div>
          <p className="text-sm font-medium">Logo del espacio</p>
          <p className="text-xs text-muted-foreground">
            Haz clic para cambiar · máx. 2 MB
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="settings-name">Nombre</Label>
        <Input id="settings-name" {...register('name')} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="settings-desc">Descripción</Label>
        <Textarea id="settings-desc" rows={4} {...register('description')} />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {message && (
        <p className="text-sm text-primary">{message}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        disabled={!isDirty || update.isPending || uploadLogo.isPending}
      >
        {(update.isPending || uploadLogo.isPending) && (
          <Loader2 className="size-4 animate-spin" />
        )}
        Guardar cambios
      </Button>
    </form>
  );
}
