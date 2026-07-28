import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Mail, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../../lib/axios';

const resetSolicitSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Introduce un correo electrónico válido'),
});

type ResetSolicitValues = z.infer<typeof resetSolicitSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetSolicitValues>({
    resolver: zodResolver(resetSolicitSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ResetSolicitValues) => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      await api.post('/auth/forgot-password', {
        email: data.email,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        'Error al procesar la solicitud. Inténtelo de nuevo.';
      setErrorStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] z-10 animate-fade-in my-6">
      {/* Cabecera de marca */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 bg-[#4648d4] rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-[#4648d4]/20 text-white">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h2 className="font-sans text-xl font-bold text-[#4648d4] tracking-tight">
          Visualizate
        </h2>
      </div>

      {/* Tarjeta de Restablecimiento */}
      <div className="bg-white dark:bg-card border border-border p-6 md:p-8 rounded-xl shadow-xl shadow-foreground/5 flex flex-col gap-6 relative">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans text-2xl font-bold text-foreground">
            Restablece tu contraseña
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña
          </p>
        </div>

        {errorStatus && (
          <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-r-lg">
            {errorStatus}
          </div>
        )}

        {isSuccess ? (
          <div className="animate-fade-in flex flex-col gap-4 text-center mt-2">
            <div className="p-4 bg-green-500/10 border-l-4 border-green-500 text-green-700 dark:text-green-400 text-sm text-left rounded-r-lg">
              Si la cuenta existe, se ha enviado un correo de recuperación a tu
              bandeja de entrada. Por favor, revisa la carpeta de spam si no lo
              ves en unos minutos.
            </div>

            <Link
              to="/login"
              className="mt-4 w-full bg-[#4648d4] text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-[#4648d4]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold text-muted-foreground px-1"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  className={`w-full px-3 py-2 pl-10 rounded-lg border bg-[#f3f4f5] dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4648d4]/10 focus:border-[#4648d4] transition-all text-sm ${
                    errors.email ? 'border-destructive' : 'border-border'
                  }`}
                  {...register('email')}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive px-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4648d4] hover:bg-[#4648d4]/90 text-white font-semibold py-2.5 rounded-lg shadow-md shadow-[#4648d4]/10 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando enlace...
                </>
              ) : (
                <>
                  Enviar correo de recuperación
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {!isSuccess && (
          <div className="flex justify-center border-t border-border pt-4">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-[#4648d4] hover:text-[#4648d4]/90 font-semibold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        ¿Tienes problemas?{' '}
        <a
          href="#"
          className="text-foreground hover:text-[#4648d4] transition-colors font-medium underline underline-offset-4"
        >
          Contacta con soporte
        </a>
      </p>
    </div>
  );
}
