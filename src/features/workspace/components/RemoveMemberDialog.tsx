import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { WorkspaceMember } from '../api/workspace.api';
import { useRemoveMember } from '../hooks/useWorkspaceMembers';

interface RemoveMemberDialogProps {
  workspaceId: string;
  member: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RemoveMemberDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
  const removeMember = useRemoveMember(workspaceId);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    if (!member) return;
    setError(null);
    try {
      await removeMember.mutateAsync(member.userId);
      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'No se pudo eliminar al miembro');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar miembro</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Seguro que quieres eliminar a{' '}
            <strong>{member?.fullName}</strong> del espacio? Perderá el acceso
            de inmediato.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={removeMember.isPending}
          >
            {removeMember.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
