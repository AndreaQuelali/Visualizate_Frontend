import { Loader2, Mail, RotateCcw, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WorkspaceInvitation, WorkspaceRole } from '../api/workspace.api';
import {
  useCancelInvitation,
  useResendInvitation,
} from '../hooks/useWorkspaceInvitations';

const roleLabels: Record<WorkspaceRole, string> = {
  ADMIN: 'Administrador',
  DESIGNER: 'Diseñador',
  ORGANIZER: 'Organizador',
};

interface InvitationsTableProps {
  workspaceId: string;
  invitations: WorkspaceInvitation[];
}

export default function InvitationsTable({
  workspaceId,
  invitations,
}: InvitationsTableProps) {
  const resend = useResendInvitation(workspaceId);
  const cancel = useCancelInvitation(workspaceId);

  if (invitations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No hay invitaciones pendientes.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Expira</TableHead>
            <TableHead className="w-36" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-medium">
                <span className="inline-flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  {inv.email}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{roleLabels[inv.role]}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">Pendiente</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(inv.expiresAt).toLocaleDateString('es-ES')}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Reenviar"
                    onClick={() => resend.mutate(inv.id)}
                    disabled={resend.isPending}
                  >
                    {resend.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RotateCcw className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Cancelar"
                    onClick={() => cancel.mutate(inv.id)}
                    disabled={cancel.isPending}
                  >
                    <X className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
