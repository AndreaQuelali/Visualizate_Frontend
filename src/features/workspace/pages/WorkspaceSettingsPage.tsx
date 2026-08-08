import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspace } from '../hooks/useWorkspaces';
import { useWorkspaceMembers } from '../hooks/useWorkspaceMembers';
import { useWorkspaceInvitations } from '../hooks/useWorkspaceInvitations';
import WorkspaceSettingsForm from '../components/WorkspaceSettingsForm';
import MembersTable from '../components/MembersTable';
import InviteMemberDialog from '../components/InviteMemberDialog';
import InvitationsTable from '../components/InvitationsTable';
import DangerZone from '../components/DangerZone';

export default function WorkspaceSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: workspace, isLoading, isError } = useWorkspace(id);
  const { data: members = [] } = useWorkspaceMembers(id);
  const { data: invitations = [] } = useWorkspaceInvitations(
    workspace?.role === 'ADMIN' ? id : undefined,
  );

  if (isLoading) {
    return (
      <PageContainer>
        <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
      </PageContainer>
    );
  }

  if (isError || !workspace) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo cargar el espacio de trabajo.
        </div>
      </PageContainer>
    );
  }

  if (workspace.role !== 'ADMIN') {
    return <Navigate to="/workspaces" replace />;
  }

  return (
    <PageContainer>
      <Link
        to="/workspaces"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Volver a espacios
      </Link>

      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{workspace.name}</p>
      </div>

      <Tabs
        defaultValue="general"
        orientation="vertical"
        className="flex-col gap-6 md:flex-row md:items-start"
      >
        <TabsList
          variant="line"
          className="h-auto w-full shrink-0 flex-col items-stretch justify-start gap-1 md:w-48"
        >
          <TabsTrigger value="general" className="flex-none justify-start px-3 py-2">
            General
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-none justify-start px-3 py-2">
            Miembros
          </TabsTrigger>
          <TabsTrigger
            value="invitations"
            className="flex-none justify-start px-3 py-2"
          >
            Invitaciones
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex-none justify-start px-3 py-2">
            Zona de peligro
          </TabsTrigger>
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="general" className="pt-0">
            <WorkspaceSettingsForm workspace={workspace} />
          </TabsContent>

          <TabsContent value="members" className="space-y-4 pt-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-medium">Miembros</h2>
                <p className="text-sm text-muted-foreground">
                  Administra quién tiene acceso al espacio.
                </p>
              </div>
              <InviteMemberDialog workspaceId={workspace.id} />
            </div>
            <MembersTable
              workspaceId={workspace.id}
              members={members}
              isAdmin
            />
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4 pt-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-medium">Invitaciones pendientes</h2>
                <p className="text-sm text-muted-foreground">
                  Reenvía o cancela invitaciones aún no aceptadas.
                </p>
              </div>
              <InviteMemberDialog workspaceId={workspace.id} />
            </div>
            <InvitationsTable
              workspaceId={workspace.id}
              invitations={invitations}
            />
          </TabsContent>

          <TabsContent value="danger" className="pt-0">
            <DangerZone workspace={workspace} />
          </TabsContent>
        </div>
      </Tabs>
    </PageContainer>
  );
}
