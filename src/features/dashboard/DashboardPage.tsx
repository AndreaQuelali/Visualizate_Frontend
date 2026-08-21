import { Link, Navigate } from 'react-router-dom';
import {
  AlertCircle,
  FileImage,
  LayoutTemplate,
  Settings,
  Upload,
} from 'lucide-react';
import Can from '@/components/Can';
import PageContainer from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { useActiveWorkspace } from '@/features/workspace/hooks/useActiveWorkspace';
import { ADMIN_ONLY, EDITORS } from '@/features/workspace/permissions';
import { getErrorMessage } from '@/lib/errors';
import { isBlockError } from './api/dashboard.api';
import BlockFrame from './components/BlockFrame';
import {
  PendingReviewsList,
  RecentPiecesList,
  RecentRendersList,
  TopTemplatesList,
} from './components/DashboardBlocks';
import GettingStarted from './components/GettingStarted';
import UsageCard from './components/UsageCard';
import { useDashboard } from './hooks/useDashboard';

export default function DashboardPage() {
  const {
    workspaceId,
    workspace,
    role,
    isLoading: wsLoading,
  } = useActiveWorkspace();
  const { data, isLoading, isError, error, refetch } =
    useDashboard(workspaceId);

  if (!wsLoading && (!workspaceId || !workspace)) {
    return <Navigate to="/workspaces" replace />;
  }

  const retry = () => void refetch();
  const onboarding =
    data && !isBlockError(data.onboarding) ? data.onboarding : null;
  const isNewWorkspace = onboarding !== null && !onboarding.piece;

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Dashboard
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
            {workspace?.name ?? 'Cargando…'}
          </h1>
        </div>
        <nav aria-label="Accesos rápidos" className="flex flex-wrap gap-2">
          <Button render={<Link to="/pieces/new" />}>
            <FileImage className="size-4" />
            Nueva pieza
          </Button>
          <Can role={EDITORS}>
            <Button variant="outline" render={<Link to="/templates?new=1" />}>
              <LayoutTemplate className="size-4" />
              Nueva plantilla
            </Button>
            <Button variant="outline" render={<Link to="/assets" />}>
              <Upload className="size-4" />
              Subir asset
            </Button>
          </Can>
          <Can role={ADMIN_ONLY}>
            <Button
              variant="ghost"
              render={<Link to={`/workspaces/${workspaceId}/settings`} />}
            >
              <Settings className="size-4" />
              Configuración
            </Button>
          </Can>
        </nav>
      </div>

      {isError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-r-lg border-l-4 border-destructive bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p>{getErrorMessage(error, 'No se pudo cargar el dashboard.')}</p>
            <Button
              variant="ghost"
              size="xs"
              className="mt-1 -ml-2 text-destructive"
              onClick={retry}
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {isNewWorkspace && onboarding && (
        <div className="mb-6">
          <GettingStarted onboarding={onboarding} role={role} />
        </div>
      )}

      {!isError && (
        <div className="grid gap-4 lg:grid-cols-3">
          {!isNewWorkspace && (
            <BlockFrame
              className="lg:col-span-3"
              title="Piezas recientes"
              description="Las últimas que editaste"
              block={data?.recentPieces}
              isLoading={isLoading}
              emptyMessage="Todavía no hay piezas."
              isEmpty={(p) => p.length === 0}
              onRetry={retry}
            >
              {(pieces) => (
                <RecentPiecesList
                  workspaceId={workspaceId ?? ''}
                  pieces={pieces}
                />
              )}
            </BlockFrame>
          )}

          {!isNewWorkspace && (
            <BlockFrame
              className="lg:col-span-2"
              title="Exportaciones recientes"
              block={data?.recentRenders}
              isLoading={isLoading}
              emptyMessage="Aún no has exportado ninguna pieza."
              isEmpty={(r) => r.length === 0}
              onRetry={retry}
            >
              {(renders) => <RecentRendersList renders={renders} />}
            </BlockFrame>
          )}

          <BlockFrame
            className={isNewWorkspace ? 'lg:col-span-3' : undefined}
            title="Uso del periodo"
            description="Consumo frente al límite de tu espacio"
            block={data?.usage}
            isLoading={isLoading}
            emptyMessage=""
            isEmpty={() => false}
            onRetry={retry}
          >
            {(usage) => <UsageCard usage={usage} />}
          </BlockFrame>

          {!isNewWorkspace && (
            <>
              <BlockFrame
                className="lg:col-span-2"
                title="Revisiones pendientes"
                description="Piezas con recomendaciones por decidir"
                block={data?.pendingReviews}
                isLoading={isLoading}
                emptyMessage="No hay recomendaciones pendientes."
                isEmpty={(r) => r.length === 0}
                onRetry={retry}
              >
                {(reviews) => <PendingReviewsList reviews={reviews} />}
              </BlockFrame>

              <BlockFrame
                title="Plantillas más usadas"
                block={data?.topTemplates}
                isLoading={isLoading}
                emptyMessage="Aún no hay plantillas con piezas."
                isEmpty={(t) => t.length === 0}
                onRetry={retry}
              >
                {(templates) => <TopTemplatesList templates={templates} />}
              </BlockFrame>
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
}
