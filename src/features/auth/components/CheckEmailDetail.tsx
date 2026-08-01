import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, RefreshCw, Info, CheckCircle } from 'lucide-react';
import api from '../../../lib/axios';

export default function CheckEmailDetail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '[tu correo electrónico]';
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const resendEmail = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    setIsSent(false);
    try {
      await api.post('/auth/forgot-password', { email }); // reuse forgot password logic to resend verification or similar
      setIsSent(true);
      setTimeout(() => setIsSent(false), 5000);
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      setErrorStatus(
        err.response?.data?.message ||
          'Error al reenviar el correo. Por favor, intente más tarde.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center text-center animate-fade-in my-6">
      {/* Icon Section */}
      <div className="relative mb-8 flex justify-center">
        {/* Soft atmospheric glow circles */}
        <div className="w-32 h-32 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 rounded-full bg-primary animate-pulse"></div>
        <div className="w-24 h-24 bg-[#6063ee]/10 rounded-full flex items-center justify-center relative z-10 animate-bounce-slow">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <Mail className="text-white w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4 mb-8">
        <h1 className="font-sans text-2xl font-bold text-foreground">
          Revisa tu bandeja de entrada
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hemos enviado un enlace de verificación a{' '}
          <span className="font-semibold text-foreground">{email}</span>. Por
          favor, haz clic en el enlace para verificar tu cuenta y desbloquear
          todas las funciones.
        </p>

        {errorStatus && (
          <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-xs text-left rounded-r-lg">
            {errorStatus}
          </div>
        )}
      </div>

      {/* Action Section */}
      <div className="w-full flex flex-col gap-4 items-center">
        <button
          onClick={resendEmail}
          disabled={isLoading || isSent}
          className="group flex items-center justify-center gap-2 bg-white border border-border text-foreground hover:bg-muted font-bold px-6 py-2.5 rounded-lg w-full transition-all duration-200 active:scale-[0.98] disabled:opacity-75 text-sm"
        >
          {isSent ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500 fill-green-500/10" />
              <span>¡Enviado!</span>
            </>
          ) : isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              <span>Enviando enlace...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
              <span>Reenviar correo</span>
            </>
          )}
        </button>

        <div className="flex flex-col gap-1 text-center">
          <p className="text-xs text-muted-foreground">
            ¿Ingresaste una dirección incorrecta?
          </p>
          <Link
            to="/register"
            className="text-primary text-xs font-semibold hover:underline decoration-2 underline-offset-4 transition-all"
          >
            Cambiar dirección de correo electrónico
          </Link>
        </div>
      </div>

      {/* Contextual Help Card */}
      <div className="mt-8 p-4 bg-[#edeeef] dark:bg-muted rounded-xl border border-border text-left w-full flex gap-3 items-start">
        <Info className="text-muted-foreground w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">
            ¿No encuentras el correo?
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Revisa tu carpeta de spam o correo no deseado. El enlace expirará en
            24 horas por tu seguridad.
          </p>
        </div>
      </div>
    </div>
  );
}
