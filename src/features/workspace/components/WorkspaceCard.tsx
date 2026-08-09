import { Check, Users } from 'lucide-react';
import type { Workspace } from '../api/workspace.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const roleLabels: Record<Workspace['role'], string> = {
  ADMIN: 'Administrador',
  DESIGNER: 'Diseñador',
  ORGANIZER: 'Organizador',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface WorkspaceCardProps {
  workspace: Workspace;
  isActive?: boolean;
  onSelect: (workspace: Workspace) => void;
}

export default function WorkspaceCard({
  workspace,
  isActive,
  onSelect,
}: WorkspaceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(workspace)}
      className={cn(
        'group relative flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border',
      )}
    >
      {isActive && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          <Check className="size-3" />
          Activo
        </span>
      )}

      <div className="flex items-start gap-3">
        <Avatar size="lg" className="rounded-xl">
          {workspace.logoUrl ? (
            <AvatarImage src={workspace.logoUrl} alt={workspace.name} />
          ) : null}
          <AvatarFallback className="rounded-xl bg-primary/15 font-semibold text-primary">
            {initials(workspace.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 pr-16">
          <h3 className="truncate font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">
            {workspace.name}
          </h3>
          {workspace.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {workspace.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground/70 italic">
              Sin descripción
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline">{roleLabels[workspace.role]}</Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          {workspace.memberCount}{' '}
          {workspace.memberCount === 1 ? 'miembro' : 'miembros'}
        </span>
      </div>
    </button>
  );
}
