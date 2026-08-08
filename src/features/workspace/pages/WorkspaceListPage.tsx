import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import PageContainer from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useWorkspaceStore } from '@/store/workspaceStore';
import type { Workspace } from '../api/workspace.api';
import WorkspaceCard from '../components/WorkspaceCard';
import CreateWorkspaceDialog from '../components/CreateWorkspaceDialog';

export default function WorkspaceListPage() {
  const navigate = useNavigate();
  const { data: workspaces = [], isLoading, isError } = useWorkspaces();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const [createOpen, setCreateOpen] = useState(false);

  const handleSelect = (workspace: Workspace) => {
    setActiveWorkspace(workspace.id);
    navigate('/dashboard');
  };

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" />
            Tus espacios
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
            Espacios de trabajo
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Selecciona dónde trabajar. El espacio activo determina los eventos,
            plantillas, assets y miembros que verás.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="lg">
          <Plus className="size-4" />
          Crear espacio
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudieron cargar tus espacios de trabajo.
        </div>
      )}

      {!isLoading && !isError && workspaces.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Plus className="size-6" />
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            Crea tu primer espacio
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Los espacios de trabajo agrupan a tu equipo y sus recursos creativos.
          </p>
          <Button className="mt-6" onClick={() => setCreateOpen(true)}>
            Crear espacio de trabajo
          </Button>
        </div>
      )}

      {!isLoading && workspaces.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              isActive={ws.id === activeWorkspaceId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => navigate('/dashboard')}
      />
    </PageContainer>
  );
}
