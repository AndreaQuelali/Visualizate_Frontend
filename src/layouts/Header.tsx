import { Menu } from 'lucide-react';
import { useUIStore } from '@/store';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: workspaces = [] } = useWorkspaces();
  const active = workspaces.find((w) => w.id === activeWorkspaceId);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Alternar barra lateral"
      >
        <Menu className="size-4" />
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {active?.name ?? 'Espacios de trabajo'}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {active
            ? `${active.memberCount} miembro${active.memberCount === 1 ? '' : 's'}`
            : 'Selecciona o crea un espacio para empezar'}
        </p>
      </div>
    </header>
  );
}
