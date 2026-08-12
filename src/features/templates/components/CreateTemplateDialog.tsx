import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
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
import { getErrorMessage } from '@/lib/errors';
import { useCreateTemplate } from '../hooks/useTemplates';

const schema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateTemplateDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTemplateDialog({
  workspaceId,
  open,
  onOpenChange,
}: CreateTemplateDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const create = useCreateTemplate(workspaceId);
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
      setError(null);
    }
    onOpenChange(next);
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await create.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });
      handleClose(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo crear la plantilla'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva plantilla</DialogTitle>
          <DialogDescription>
            Empieza con un lienzo en blanco de 1080×1080 px. Podrás cambiar el
            tamaño y el contenido más adelante.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Nombre *</Label>
            <Input
              id="tpl-name"
              placeholder="Flyer de evento"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-desc">Descripción</Label>
            <Textarea
              id="tpl-desc"
              rows={3}
              placeholder="¿Para qué se usa esta plantilla?"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          {error && (
            <p className="rounded-lg border-l-4 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={create.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />}
              Crear plantilla
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
