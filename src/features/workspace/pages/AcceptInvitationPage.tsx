import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAcceptInvitation } from '../hooks/useWorkspaces';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';

export default function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const accept = useAcceptInvitation();
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !token || status !== 'idle') {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const workspace = await accept.mutateAsync(token);
        if (cancelled) return;
        setActiveWorkspace(workspace.id);
        setStatus('ok');
        setMessage(`Te uniste a ${workspace.name}`);
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(
          e.response?.data?.message ||
            'No se pudo aceptar la invitación',
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per token
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(
      `/workspaces/accept-invitation?token=${token ?? ''}`,
    );
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
          Inicia sesión para aceptar
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Debes iniciar sesión con el correo al que se envió la invitación.
        </p>
        <Button render={<Link to={`/login?redirect=${redirect}`} />}>
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <XCircle className="size-10 text-destructive" />
        <h1 className="text-xl font-semibold">Token inválido</h1>
        <Button onClick={() => navigate('/workspaces')}>Ir a espacios</Button>
      </div>
    );
  }

  if (status === 'idle' || accept.isPending) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Aceptando invitación…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      {status === 'ok' ? (
        <CheckCircle2 className="size-10 text-primary" />
      ) : (
        <XCircle className="size-10 text-destructive" />
      )}
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
        {status === 'ok' ? '¡Bienvenido!' : 'No se pudo unir'}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Button onClick={() => navigate(status === 'ok' ? '/dashboard' : '/workspaces')}>
        Continuar
      </Button>
    </div>
  );
}
