import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ANY_MEMBER,
  EDITORS,
  ADMIN_ONLY,
  hasRole,
  type WorkspaceRole,
} from '@/features/workspace/permissions';
import type { DashboardOnboarding } from '../api/dashboard.api';

const STEPS = [
  {
    key: 'brand',
    title: 'Define tu marca',
    description: 'Colores, tipografías y logo que mantienen todo consistente.',
    to: '/brand',
    cta: 'Ir a marca',
    roles: ADMIN_ONLY,
    ask: 'Pide a un administrador que configure la marca.',
  },
  {
    key: 'template',
    title: 'Crea una plantilla',
    description: 'Diseña el formato una vez y reutilízalo con un formulario.',
    to: '/templates?new=1',
    cta: 'Nueva plantilla',
    roles: EDITORS,
    ask: 'Pide a un diseñador o administrador que cree una plantilla.',
  },
  {
    key: 'piece',
    title: 'Genera tu primera pieza',
    description: 'Rellena el formulario y exporta a PNG o PDF.',
    to: '/pieces/new',
    cta: 'Nueva pieza',
    roles: ANY_MEMBER,
    ask: '',
  },
] as const;

export default function GettingStarted({
  onboarding,
  role,
}: {
  onboarding: DashboardOnboarding;
  role: WorkspaceRole | null;
}) {
  return (
    <section
      aria-label="Primeros pasos"
      className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6"
    >
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
        Empieza en tres pasos
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tu espacio está vacío. Esta es la forma más rápida de tener tu primera
        pieza lista.
      </p>
      <ol className="mt-5 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => {
          const done = onboarding[step.key];
          const allowed = hasRole(role, step.roles);
          return (
            <li
              key={step.key}
              className={cn(
                'flex flex-col rounded-xl border bg-card p-4',
                done ? 'border-primary/40' : 'border-border',
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                    done
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {done ? (
                    <Check className="size-3.5" aria-label="Hecho" />
                  ) : (
                    i + 1
                  )}
                </span>
                <h3 className="text-sm font-medium">{step.title}</h3>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                {step.description}
              </p>
              <div className="mt-auto">
                {done ? (
                  <p className="text-xs font-medium text-primary">Completado</p>
                ) : allowed ? (
                  <Button
                    size="sm"
                    variant={i === 0 ? 'default' : 'outline'}
                    render={<Link to={step.to} />}
                  >
                    {step.cta}
                    <ArrowRight className="size-3.5" />
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">{step.ask}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
