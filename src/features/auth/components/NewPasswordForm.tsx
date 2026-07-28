import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../../../lib/axios';

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Debe incluir al menos un carácter especial (!@#$%^&*)',
      ),
    confirmPassword: z.string().min(1, 'Confirmar contraseña es requerido'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export default function NewPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password', '');
  const [strength, setStrength] = useState<{
    score: number; // 0 to 3
    label: string;
    color: string;
    textColor: string;
  }>({
    score: 0,
    label: 'Ninguna',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
  });

  useEffect(() => {
    let score = 0;
    if (passwordValue.length > 0) score = 1;
    if (
      passwordValue.length >= 8 &&
      /[0-9]/.test(passwordValue) &&
      /[a-zA-Z]/.test(passwordValue)
    )
      score = 2;
    if (
      passwordValue.length >= 12 &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordValue)
    )
      score = 3;

    if (score === 0) {
      setStrength({
        score: 0,
        label: 'Ninguna',
        color: 'bg-[#e1e3e4]',
        textColor: 'text-[#767586]',
      });
    } else if (score === 1) {
      setStrength({
        score: 1,
        label: 'Débil',
        color: 'bg-destructive',
        textColor: 'text-destructive',
      });
    } else if (score === 2) {
      setStrength({
        score: 2,
        label: 'Buena',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
      });
    } else {
      setStrength({
        score: 3,
        label: 'Fuerte',
        color: 'bg-green-500',
        textColor: 'text-green-600',
      });
    }
  }, [passwordValue]);

  const onSubmit = async (data: NewPasswordValues) => {
    if (!token) {
      setErrorStatus('Token de restablecimiento faltante en la URL.');
      return;
    }
    setIsLoading(true);
    setErrorStatus(null);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        'Error al actualizar la contraseña. Token inválido o expirado.';
      setErrorStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] z-10 animate-fade-in my-6">
      {/* Cabecera de marca */}
      {!isSuccess && (
        <div className="flex justify-center mb-6">
          <span className="font-sans text-xl font-bold text-[#4648d4] tracking-tight">
            Visualizate
          </span>
        </div>
      )}

      {/* Tarjeta */}
      {isSuccess ? (
        <div className="bg-white dark:bg-card border border-border p-8 rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#4648d4]/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#4648d4] fill-[#4648d4]/10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-sans text-2xl font-bold text-foreground">
              Contraseña actualizada con éxito
            </h2>
            <p className="text-sm text-muted-foreground">
              La seguridad de tu cuenta ha sido actualizada. Ya puedes iniciar
              sesión con tus nuevas credenciales.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full bg-[#4648d4] text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-[#4648d4]/90 active:scale-[0.98] transition-all flex items-center justify-center"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-border p-6 md:p-8 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col gap-6">
          <header className="text-center md:text-left space-y-1">
            <h1 className="font-sans text-2xl font-bold text-foreground">
              Establece tu nueva contraseña
            </h1>
            <p className="text-sm text-muted-foreground">
              Tu nueva contraseña debe ser diferente de las anteriores
            </p>
          </header>

          {errorStatus && (
            <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-xs rounded-r-lg">
              {errorStatus}
            </div>
          )}

          {!token && (
            <div className="p-3 bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-400 text-xs rounded-r-lg">
              Advertencia: Falta el token de verificación en la URL. El envío
              fallará hasta que se ingrese un token válido.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nueva Contraseña */}
            <div className="space-y-1">
              <label
                className="text-xs font-semibold text-muted-foreground px-1"
                htmlFor="password"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Introduce la nueva contraseña"
                  className={`w-full px-3 py-2 pl-3 pr-10 rounded-lg border bg-[#f3f4f5] dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4648d4]/10 focus:border-[#4648d4] transition-all text-sm ${
                    errors.password ? 'border-destructive' : 'border-border'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Indicador de Robustez */}
              <div className="pt-2 space-y-1">
                <div className="flex gap-1.5 h-1">
                  <div
                    className={`flex-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-[#e1e3e4] dark:bg-muted'}`}
                  ></div>
                  <div
                    className={`flex-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-[#e1e3e4] dark:bg-muted'}`}
                  ></div>
                  <div
                    className={`flex-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-[#e1e3e4] dark:bg-muted'}`}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs px-1">
                  <span className="text-muted-foreground">
                    Fuerza de la contraseña
                  </span>
                  <span className={`font-bold ${strength.textColor}`}>
                    {strength.label}
                  </span>
                </div>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive px-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-1">
              <label
                className="text-xs font-semibold text-muted-foreground px-1"
                htmlFor="confirmPassword"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite la nueva contraseña"
                  className={`w-full px-3 py-2 pl-3 pr-10 rounded-lg border bg-[#f3f4f5] dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4648d4]/10 focus:border-[#4648d4] transition-all text-sm ${
                    errors.confirmPassword
                      ? 'border-destructive'
                      : 'border-border'
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive px-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Enviar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4648d4] text-white font-semibold py-2.5 rounded-lg hover:bg-[#4648d4]/90 active:scale-[0.98] mt-4 transition-all shadow-lg shadow-[#4648d4]/20 flex items-center justify-center gap-2 text-sm disabled:opacity-75"
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
                  Actualizando...
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Visualizate. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
