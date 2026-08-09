import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Layers3, Settings } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/PageContainer';

export default function DashboardPage() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const active = workspaces.find((w) => w.id === activeWorkspaceId);

  if (!isLoading && !activeWorkspaceId) {
    return <Navigate to="/workspaces" replace />;
  }

  if (!isLoading && activeWorkspaceId && !active) {
    return <Navigate to="/workspaces" replace />;
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Dashboard
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
          {active?.name ?? 'Cargando…'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Estás trabajando en este espacio. Eventos, plantillas, assets y
          miembros se filtrarán según el workspace activo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers3 className="size-5" />
          </div>
          <h2 className="font-medium">Cambiar de espacio</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Elige otro workspace o crea uno nuevo.
          </p>
          <Button render={<Link to="/workspaces" />}>
            Ver espacios
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {active?.role === 'ADMIN' && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <Settings className="size-5" />
            </div>
            <h2 className="font-medium">Configuración</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Edita el espacio, gestiona miembros e invitaciones.
            </p>
            <Button
              variant="outline"
              render={<Link to={`/workspaces/${active.id}/settings`} />}
            >
              Abrir configuración
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
