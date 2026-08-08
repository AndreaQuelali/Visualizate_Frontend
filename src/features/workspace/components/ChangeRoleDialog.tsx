import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkspaceMember, WorkspaceRole } from '../api/workspace.api';
import { useChangeMemberRole } from '../hooks/useWorkspaceMembers';

interface ChangeRoleDialogProps {
  workspaceId: string;
  member: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ChangeRoleForm({
  workspaceId,
  member,
  onClose,
}: {
  workspaceId: string;
  member: WorkspaceMember;
  onClose: () => void;
}) {
  const changeRole = useChangeMemberRole(workspaceId);
  const [role, setRole] = useState<WorkspaceRole>(member.role);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    setError(null);
    try {
      await changeRole.mutateAsync({ userId: member.userId, role });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'No se pudo cambiar el rol');
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cambiar rol</DialogTitle>
        <DialogDescription>
          Asigna un nuevo rol a {member.fullName}.
        </DialogDescription>
      </DialogHeader>

      <Select value={role} onValueChange={(v) => setRole(v as WorkspaceRole)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ADMIN">Administrador</SelectItem>
          <SelectItem value="DESIGNER">Diseñador</SelectItem>
          <SelectItem value="ORGANIZER">Organizador</SelectItem>
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={changeRole.isPending}>
          {changeRole.isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar
        </Button>
      </DialogFooter>
    </>
  );
}

export default function ChangeRoleDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: ChangeRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {member && (
          <ChangeRoleForm
            key={member.id}
            workspaceId={workspaceId}
            member={member}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
