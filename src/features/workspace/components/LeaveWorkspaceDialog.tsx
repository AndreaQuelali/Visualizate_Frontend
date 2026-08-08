import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useLeaveWorkspace } from '../hooks/useWorkspaces';
import { useWorkspaceStore } from '@/store/workspaceStore';
import type { Workspace } from '../api/workspace.api';

interface LeaveWorkspaceDialogProps {
  workspace: Workspace;
}

export default function LeaveWorkspaceDialog({
  workspace,
}: LeaveWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leave = useLeaveWorkspace();
  const clearActiveWorkspace = useWorkspaceStore((s) => s.clearActiveWorkspace);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const navigate = useNavigate();

  const onConfirm = async () => {
    setError(null);
    try {
      await leave.mutateAsync(workspace.id);
      if (activeWorkspaceId === workspace.id) {
        clearActiveWorkspace();
      }
      setOpen(false);
      navigate('/workspaces');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message ||
          'No puedes abandonar el espacio. Si eres el único administrador, transfiere la administración primero.',
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        <LogOut className="size-4" />
        Abandonar espacio
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandonar espacio de trabajo</AlertDialogTitle>
          <AlertDialogDescription>
            Dejarás de tener acceso a <strong>{workspace.name}</strong> y a sus
            recursos. Si eres el único administrador, primero debes transferir
            la administración a otro miembro.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={leave.isPending}
          >
            {leave.isPending && <Loader2 className="size-4 animate-spin" />}
            Abandonar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
