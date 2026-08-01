import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../../../lib/axios';

const registerSchema = z
  .object({
    fullName: z.string().min(1, 'El nombre completo es requerido'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Introduce un correo electrónico válido'),
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
    terms: z
      .boolean()
      .refine(
        (val) => val === true,
        'Debes aceptar los Términos de Servicio y la Política de Privacidad',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const passwordValue = watch('password', '');

  // Password requirements checklist state
  const [checks, setChecks] = useState({
    min: false,
    upper: false,
    lower: false,
    num: false,
    special: false,
  });

  useEffect(() => {
    setChecks({
      min: passwordValue.length >= 8,
      upper: /[A-Z]/.test(passwordValue),
      lower: /[a-z]/.test(passwordValue),
      num: /[0-9]/.test(passwordValue),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
    });
  }, [passwordValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      // Redirect to check-email with the registered email as query parameter
      navigate(`/check-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        'Error al crear la cuenta. Inténtelo de nuevo.';
      setErrorStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] z-10 animate-fade-in my-6">
      {/* Cabecera de marca */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/20 text-white">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v19M3 12h18"
            />
          </svg>
        </div>
        <h2 className="font-sans text-xl font-bold text-primary tracking-tight">
          Visualizate
        </h2>
      </div>

      {/* Tarjeta de Registro */}
      <div className="bg-white dark:bg-card border border-border p-6 md:p-8 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
        <div className="mb-6 text-center">
          <h1 className="font-sans text-2xl font-bold mb-1 text-foreground">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Empieza a transformar tus datos en visualizaciones hermosas
          </p>
        </div>

        {errorStatus && (
          <div className="mb-4 p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-r-lg">
            {errorStatus}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre Completo */}
          <div className="space-y-1">
            <label
              className="text-xs font-semibold text-muted-foreground"
              htmlFor="fullName"
            >
              Nombre completo
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                placeholder="Alex Johnson"
                className={`w-full px-3 py-2 pl-10 rounded-lg border bg-white dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm ${
                  errors.fullName ? 'border-destructive' : 'border-border'
                }`}
                {...register('fullName')}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {errors.fullName && (
              <p className="text-xs text-destructive px-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-1">
            <label
              className="text-xs font-semibold text-muted-foreground"
              htmlFor="email"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                className={`w-full px-3 py-2 pl-10 rounded-lg border bg-white dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm ${
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
            <label
              className="text-xs font-semibold text-muted-foreground"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-3 py-2 pl-10 pr-10 rounded-lg border bg-white dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm ${
                  errors.password ? 'border-destructive' : 'border-border'
                }`}
                {...register('password')}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

            {/* Requerimientos visuales de contraseña */}
            <div className="pt-2 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">
                La contraseña debe incluir:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                <div
                  className={`flex items-center gap-1.5 text-xs transition-colors ${checks.min ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${checks.min ? 'fill-primary text-white' : ''}`}
                  />
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs transition-colors ${checks.upper ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${checks.upper ? 'fill-primary text-white' : ''}`}
                  />
                  <span>Letra mayúscula</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs transition-colors ${checks.lower ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${checks.lower ? 'fill-primary text-white' : ''}`}
                  />
                  <span>Letra minúscula</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs transition-colors ${checks.num ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${checks.num ? 'fill-primary text-white' : ''}`}
                  />
                  <span>Un número</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs transition-colors ${checks.special ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${checks.special ? 'fill-primary text-white' : ''}`}
                  />
                  <span>Carácter especial</span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-1">
            <label
              className="text-xs font-semibold text-muted-foreground"
              htmlFor="confirmPassword"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={`w-full px-3 py-2 pl-10 rounded-lg border bg-white dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm ${
                  errors.confirmPassword
                    ? 'border-destructive'
                    : 'border-border'
                }`}
                {...register('confirmPassword')}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive px-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Aceptación de Términos */}
          <div className="space-y-1 pt-1">
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 rounded mt-0.5 border-border text-primary focus:ring-primary"
                {...register('terms')}
              />
              <label
                htmlFor="terms"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Acepto los{' '}
                <a
                  href="#"
                  className="text-primary font-medium hover:underline"
                >
                  Términos de servicio
                </a>{' '}
                y la{' '}
                <a
                  href="#"
                  className="text-primary font-medium hover:underline"
                >
                  Política de privacidad
                </a>
                .
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-destructive px-1">
                {errors.terms.message}
              </p>
            )}
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
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
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-3 text-xs text-muted-foreground font-semibold">
            o
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Regresar a Login */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline transition-all"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Visualizate. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
