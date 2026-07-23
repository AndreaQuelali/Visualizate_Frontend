import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../../lib/axios';

export default function VerifyEmailDetail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage(
          'Falta el token de verificación de correo electrónico.',
        );
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch (error: unknown) {
        console.error(error);
        const err = error as { response?: { data?: { message?: string } } };
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message ||
            'Token de verificación inválido o expirado.',
        );
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-card border border-border p-8 rounded-xl shadow-xl text-center flex flex-col items-center gap-6 animate-fade-in my-6">
      <div className="flex justify-center">
        <span className="font-sans text-xl font-bold text-[#4648d4] tracking-tight">
          Visualizate
        </span>
      </div>

      {status === 'loading' && (
        <div className="space-y-4 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-[#4648d4] animate-spin" />
          <h2 className="text-lg font-bold text-foreground">
            Confirmando verificación...
          </h2>
          <p className="text-sm text-muted-foreground">
            Por favor espera un momento mientras validamos tu cuenta.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6 flex flex-col items-center w-full">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
            <CheckCircle className="w-10 h-10 text-green-500 fill-green-500/10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              ¡Correo verificado con éxito!
            </h2>
            <p className="text-sm text-muted-foreground">
              Tu cuenta ha sido activada correctamente. Ahora puedes continuar y
              disfrutar de todas las funcionalidades.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full bg-[#4648d4] text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-[#4648d4]/90 active:scale-[0.98] transition-all flex items-center justify-center"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6 flex flex-col items-center w-full">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Error de verificación
            </h2>
            <p className="text-sm text-destructive font-medium">
              {errorMessage}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Link
              to="/register"
              className="w-full bg-white border border-border text-foreground hover:bg-muted py-2.5 rounded-lg text-sm font-semibold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Crear una nueva cuenta
            </Link>
            <Link
              to="/login"
              className="text-xs font-semibold text-[#4648d4] hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
