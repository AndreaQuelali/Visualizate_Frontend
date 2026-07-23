import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/axios';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Introduce un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { accessToken, user } = response.data;
      login(accessToken, user);
      navigate('/');
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        'Error al iniciar sesión. Inténtelo de nuevo.';
      setErrorStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] z-10 animate-fade-in">
      {/* Cabecera de marca */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-[#4648d4] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#4648d4]/20 text-white">
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 21L14.907 18M21 3L3.003 9.003L10.5 13.5M21 3L17 21L10.5 13.5M21 3L10.5 13.5"
            />
          </svg>
        </div>
        <h2 className="font-sans text-2xl font-bold text-[#4648d4] tracking-tight">
          Visualizate
        </h2>
      </div>

      {/* Tarjeta de Login */}
      <div className="bg-white dark:bg-card border border-border p-6 md:p-8 rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
        <div className="mb-6 text-center md:text-left">
          <h1 className="font-sans text-2xl font-bold mb-1 text-foreground">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-muted-foreground">
            Introduce tus credenciales para acceder a tu cuenta
          </p>
        </div>

        {errorStatus && (
          <div className="mb-4 p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-r-lg">
            {errorStatus}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Correo Electrónico */}
          <div className="space-y-1">
            <label
              className="text-xs font-semibold text-muted-foreground px-1"
              htmlFor="email"
            >
              Correo electrónico
            </label>
            <div className="relative">
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

          {/* Contraseña */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label
                className="text-xs font-semibold text-muted-foreground"
                htmlFor="password"
              >
                Contraseña
              </label>
              <Link
                to="/reset-password"
                className="text-xs font-semibold text-[#4648d4] hover:underline transition-all"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-3 py-2 pl-3 pr-10 rounded-lg border bg-[#f3f4f5] dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4648d4]/10 focus:border-[#4648d4] transition-all text-sm ${
                  errors.password ? 'border-destructive' : 'border-border'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive px-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Recordarme */}
          <div className="flex items-center space-x-2 px-1">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 rounded border-border text-[#4648d4] focus:ring-[#4648d4] focus:ring-offset-background"
              {...register('remember')}
            />
            <label
              htmlFor="remember"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Recordarme
            </label>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4648d4] text-white py-2.5 rounded-lg shadow-sm hover:bg-[#4648d4]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed"
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
                Iniciando sesión...
              </>
            ) : (
              <>
                Iniciar sesión
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-card text-muted-foreground font-semibold">
              O
            </span>
          </div>
        </div>

        {/* Enlace de Registro */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="text-[#4648d4] font-semibold hover:underline transition-all"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      {/* Enlaces del Pie */}
      <div className="mt-6 flex justify-center gap-4 text-xs text-muted-foreground">
        <a href="#" className="hover:text-[#4648d4] transition-colors">
          Política de privacidad
        </a>
        <a href="#" className="hover:text-[#4648d4] transition-colors">
          Términos de servicio
        </a>
      </div>
    </div>
  );
}
