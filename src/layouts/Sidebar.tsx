import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@/features/workspace/api/workspace.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

function workspaceInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function roleLabel(role: Workspace['role']) {
  const map: Record<Workspace['role'], string> = {
    ADMIN: 'Admin',
    DESIGNER: 'Diseñador',
    ORGANIZER: 'Organizador',
  };
  return map[role];
}

interface SidebarProps {
  onCreateWorkspace?: () => void;
}

export default function Sidebar({ onCreateWorkspace }: SidebarProps) {
  const navigate = useNavigate();
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const clearActiveWorkspace = useWorkspaceStore((s) => s.clearActiveWorkspace);
  const { data: workspaces = [] } = useWorkspaces();

  const active = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;

  const handleLogout = () => {
    clearActiveWorkspace();
    logout();
    navigate('/login', { replace: true });
  };

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspace(id);
    navigate('/dashboard');
  };

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Configuración',
      to: active ? `/workspaces/${active.id}/settings` : '/workspaces',
      icon: Settings,
      adminOnly: true,
    },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-[72px]',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        <Link
          to="/workspaces"
          className="flex items-center gap-2 overflow-hidden rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <span className="text-sm font-bold">V</span>
          </div>
          {isSidebarOpen && (
            <span className="truncate font-[family-name:var(--font-heading)] text-base font-semibold tracking-tight">
              Visualizate
            </span>
          )}
        </Link>
      </div>

      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  'h-auto w-full justify-start gap-2 border-sidebar-border bg-sidebar-accent/40 px-2 py-2 hover:bg-sidebar-accent',
                  !isSidebarOpen && 'justify-center px-0',
                )}
              />
            }
          >
            <Avatar size="sm" className="rounded-md">
              {active?.logoUrl ? (
                <AvatarImage src={active.logoUrl} alt={active.name} />
              ) : null}
              <AvatarFallback className="rounded-md bg-primary/15 text-primary">
                {active ? workspaceInitials(active.name) : 'WS'}
              </AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">
                    {active?.name ?? 'Seleccionar espacio'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {active ? roleLabel(active.role) : 'Sin workspace'}
                  </p>
                </div>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Espacios de trabajo</DropdownMenuLabel>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws.id)}
                  className={cn(ws.id === activeWorkspaceId && 'bg-accent')}
                >
                  <Avatar size="sm" className="rounded-md">
                    {ws.logoUrl ? (
                      <AvatarImage src={ws.logoUrl} alt={ws.name} />
                    ) : null}
                    <AvatarFallback className="rounded-md bg-primary/15 text-primary">
                      {workspaceInitials(ws.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{ws.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/workspaces')}>
                Ver todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateWorkspace}>
                <Plus className="size-4" />
                Crear nuevo
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems
          .filter(
            (item) =>
              !item.adminOnly || !active || active.role === 'ADMIN',
          )
          .map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  !isSidebarOpen && 'justify-center',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className={cn(
                  'h-auto w-full justify-start gap-2 px-2 py-2',
                  !isSidebarOpen && 'justify-center px-0',
                )}
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/20 text-primary">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">
                  {user?.fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="size-4" />
                Perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
