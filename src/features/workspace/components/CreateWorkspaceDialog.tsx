import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImagePlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateWorkspace } from '../hooks/useWorkspaces';
import { workspaceApi } from '../api/workspace.api';
import { useWorkspaceStore } from '@/store/workspaceStore';

const schema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}

export default function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createWorkspace = useCreateWorkspace();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const handleClose = (next: boolean) => {
    if (!next) {
      reset();
      setLogoFile(null);
      setPreview(null);
      setError(null);
    }
    onOpenChange(next);
  };

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const workspace = await createWorkspace.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });

      if (logoFile) {
        try {
          await workspaceApi.uploadLogo(workspace.id, logoFile);
        } catch {
          // Workspace already created; logo failure is non-blocking
        }
      }

      setActiveWorkspace(workspace.id);
      onCreated?.(workspace.id);
      handleClose(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message ||
          'No se pudo crear el espacio de trabajo',
      );
    }
  };

  const isLoading = createWorkspace.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear espacio de trabajo</DialogTitle>
          <DialogDescription>
            Organiza eventos, plantillas y assets de tu equipo en un solo lugar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="relative flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 transition-colors hover:border-primary/50">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa del logo"
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
              <p className="text-sm font-medium">Logo (opcional)</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPEG, WebP o SVG · máx. 2 MB
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Nombre *</Label>
            <Input
              id="ws-name"
              placeholder="Equipo Marketing"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-desc">Descripción</Label>
            <Textarea
              id="ws-desc"
              placeholder="¿Para qué usarán este espacio?"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Crear espacio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
