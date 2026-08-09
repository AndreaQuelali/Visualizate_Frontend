import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WorkspaceMember, WorkspaceRole } from '../api/workspace.api';
import ChangeRoleDialog from './ChangeRoleDialog';
import RemoveMemberDialog from './RemoveMemberDialog';
import { useAuthStore } from '@/store/authStore';

const roleLabels: Record<WorkspaceRole, string> = {
  ADMIN: 'Administrador',
  DESIGNER: 'Diseñador',
  ORGANIZER: 'Organizador',
};

interface MembersTableProps {
  workspaceId: string;
  members: WorkspaceMember[];
  isAdmin: boolean;
}

export default function MembersTable({
  workspaceId,
  members,
  isAdmin,
}: MembersTableProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [roleTarget, setRoleTarget] = useState<WorkspaceMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(
    null,
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Incorporación</TableHead>
              {isAdmin && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.fullName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{roleLabels[member.role]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.status === 'ACTIVE' ? 'default' : 'secondary'
                    }
                  >
                    {member.status === 'ACTIVE' ? 'Activo' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(member.joinedAt).toLocaleDateString('es-ES')}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {member.userId !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setRoleTarget(member)}
                          >
                            Cambiar rol
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setRemoveTarget(member)}
                            className="text-destructive"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ChangeRoleDialog
        workspaceId={workspaceId}
        member={roleTarget}
        open={!!roleTarget}
        onOpenChange={(open) => !open && setRoleTarget(null)}
      />
      <RemoveMemberDialog
        workspaceId={workspaceId}
        member={removeTarget}
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      />
    </>
  );
}
