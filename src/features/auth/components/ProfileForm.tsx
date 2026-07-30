import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore, type User as AuthUser } from '../../../store/authStore';
import {
  User,
  Mail,
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  Save,
  Check,
} from 'lucide-react';
import api from '../../../lib/axios';

const profileSchema = z.object({
  fullName: z.string().min(1, 'El nombre es obligatorio'),
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Introduce un correo electrónico válido'),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: 'La nueva contraseña debe tener al menos 8 caracteres',
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, updateUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      password: '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorStatus(null);
    try {
      const payload: { fullName: string; email: string; password?: string } = {
        fullName: data.fullName,
        email: data.email,
      };

      if (data.password) {
        payload.password = data.password;
      }

      const response = await api.patch('/auth/profile', payload);

      // Update global store
      updateUser(response.data as Partial<AuthUser>);
      setSuccessMessage('Perfil actualizado correctamente.');
      setValue('password', ''); // Clear password field
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        'Error al actualizar el perfil. Intenta de nuevo.';
      setErrorStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in bg-white dark:bg-card border border-border p-6 md:p-8 rounded-xl shadow-sm">
      <header className="border-b border-border pb-4">
        <h1 className="font-sans text-xl font-bold text-foreground">
          Ajustes del perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra los detalles personales y de seguridad de tu cuenta
        </p>
      </header>

      {/* Verification Alert */}
      {user && !user.isVerified && (
        <div className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
              Verifica tu cuenta
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tu correo <span className="font-semibold">{user.email}</span> no
              ha sido verificado. Hemos enviado un correo con instrucciones de
              verificación para validar tu cuenta.
            </p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-500/10 border-l-4 border-green-500 text-green-700 dark:text-green-400 text-sm rounded-r-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {errorStatus && (
        <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-r-lg">
          {errorStatus}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className={`w-full px-3 py-2 pl-10 rounded-lg border bg-[#f3f4f5] dark:bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm ${
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
                className={`w-full px-3 py-2 pl-10 rounded-lg border bg-[#f3f4f5] dark:bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm ${
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
        </div>

        {/* Change password section */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">
              Cambiar contraseña
            </h3>
          </div>

          <div className="space-y-1 max-w-md">
            <label
              className="text-xs font-semibold text-muted-foreground"
              htmlFor="password"
            >
              Contraseña nueva
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Dejar en blanco si no deseas cambiarla"
                className={`w-full px-3 py-2 pl-3 pr-10 rounded-lg border bg-[#f3f4f5] dark:bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm ${
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
        </div>

        {/* Submit */}
        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 active:scale-[0.98] transition-all py-2 px-6 rounded-lg text-sm font-bold shadow-md shadow-primary/15 disabled:opacity-75"
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
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
