import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkspaceRole } from '../api/workspace.api';
import { useInviteMember } from '../hooks/useWorkspaceInvitations';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  role: z.enum(['ADMIN', 'DESIGNER', 'ORGANIZER']),
});

type FormValues = z.infer<typeof schema>;

interface InviteMemberDialogProps {
  workspaceId: string;
}

export default function InviteMemberDialog({
  workspaceId,
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invite = useInviteMember(workspaceId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'DESIGNER' },
  });

  const role = watch('role');

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await invite.mutateAsync(values);
      reset();
      setOpen(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message || 'No se pudo enviar la invitación',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus className="size-4" />
        Invitar miembro
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar miembro</DialogTitle>
          <DialogDescription>
            Enviaremos un correo con un enlace para unirse al espacio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Correo electrónico</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colaborador@empresa.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Rol</Label>
            <Select
              value={role}
              onValueChange={(v) =>
                setValue('role', v as WorkspaceRole, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="DESIGNER">Diseñador</SelectItem>
                <SelectItem value="ORGANIZER">Organizador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending && <Loader2 className="size-4 animate-spin" />}
              Enviar invitación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
