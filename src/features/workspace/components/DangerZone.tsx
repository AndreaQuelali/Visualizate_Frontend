import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteWorkspace } from '../hooks/useWorkspaces';
import { useWorkspaceStore } from '@/store/workspaceStore';
import type { Workspace } from '../api/workspace.api';
import LeaveWorkspaceDialog from './LeaveWorkspaceDialog';

interface DangerZoneProps {
  workspace: Workspace;
}

export default function DangerZone({ workspace }: DangerZoneProps) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const remove = useDeleteWorkspace();
  const clearActiveWorkspace = useWorkspaceStore((s) => s.clearActiveWorkspace);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const navigate = useNavigate();

  const canDelete = confirmName === workspace.name;

  const onDelete = async () => {
    setError(null);
    try {
      await remove.mutateAsync(workspace.id);
      if (activeWorkspaceId === workspace.id) {
        clearActiveWorkspace();
      }
      setOpen(false);
      navigate('/workspaces');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message || 'No se pudo eliminar el espacio',
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-5">
        <h3 className="font-medium">Abandonar espacio</h3>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Dejarás de pertenecer a este espacio de trabajo.
        </p>
        <LeaveWorkspaceDialog workspace={workspace} />
      </div>

      {workspace.role === 'ADMIN' && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-4" />
            <h3 className="font-medium">Zona de peligro</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Eliminar el espacio es irreversible. Se perderán miembros,
            invitaciones y la asociación de recursos.
          </p>

          <AlertDialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) {
                setConfirmName('');
                setError(null);
              }
            }}
          >
            <AlertDialogTrigger
              render={<Button variant="destructive" />}
            >
              <Trash2 className="size-4" />
              Eliminar espacio de trabajo
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
                <AlertDialogDescription>
                  Escribe <strong>{workspace.name}</strong> para confirmar que
                  quieres eliminar este espacio de forma permanente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-delete">Nombre del espacio</Label>
                <Input
                  id="confirm-delete"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={workspace.name}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={!canDelete || remove.isPending}
                  onClick={onDelete}
                >
                  {remove.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Eliminar definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
