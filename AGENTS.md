# AGENTS.md — Visualizate Frontend

> Guía de orientación para agentes de IA (Copilot, Antigravity, Claude, Codex, etc.)
> que trabajen en este repositorio. Léela **antes** de modificar o generar código.

---

## 1. Visión general del proyecto

**Visualizate** es una plataforma de creación de contenido visual. Este repositorio
contiene el **frontend SPA** construido con:

| Capa          | Tecnología                                           |
| ------------- | ---------------------------------------------------- |
| Framework     | React 19 + TypeScript                                |
| Build tool    | Vite 8                                               |
| Estilos       | Tailwind CSS 3 (con variables CSS / OKLCH)           |
| UI Components | shadcn/ui (estilo `base-nova`) + `@base-ui/react`    |
| Iconos        | Lucide React                                         |
| Fuente        | Geist Variable (`@fontsource-variable/geist`)        |
| Animaciones   | `tw-animate-css`                                     |
| Routing       | React Router DOM v7 (`createBrowserRouter`)          |
| Estado global | Zustand v5                                           |
| Server state  | TanStack Query v5                                    |
| HTTP Client   | Axios (instancia centralizada en `src/lib/axios.ts`) |
| Formularios   | React Hook Form v7 + Zod v4 + `@hookform/resolvers`  |
| Linting       | ESLint + TypeScript ESLint + Prettier                |
| Commits       | Conventional Commits (Commitlint + Husky)            |

---

## 2. Estructura de directorios

```
src/
├── assets/                 # Imágenes estáticas, SVG, etc.
├── components/             # Componentes compartidos reutilizables
│   ├── ui/                 # Componentes de UI (shadcn/ui generados)
│   │   └── button.tsx      # Button con CVA y @base-ui/react
│   ├── PageContainer.tsx   # Wrapper de página con padding estándar
│   └── ProtectedRoute.tsx  # Guard de rutas privadas
├── features/               # Módulos de funcionalidad por dominio
│   └── auth/
│       └── components/     # Formularios y vistas de autenticación
│           ├── LoginForm.tsx
│           ├── RegisterForm.tsx
│           ├── CheckEmailDetail.tsx
│           ├── ResetPasswordForm.tsx
│           ├── NewPasswordForm.tsx
│           ├── VerifyEmailDetail.tsx
│           └── ProfileForm.tsx
├── layouts/                # Layouts de página
│   ├── AuthLayout.tsx      # Centrado, fondo decorativo, redirige si autenticado
│   ├── AppLayout.tsx       # Header + Sidebar + <Outlet>
│   ├── Header.tsx          # Cabecera de la app principal (skeleton)
│   └── Sidebar.tsx         # Barra lateral (skeleton)
├── lib/
│   ├── axios.ts            # Instancia Axios con interceptores de auth
│   └── utils.ts            # Utilitario cn() (clsx + tailwind-merge)
├── routes/
│   └── index.tsx           # Definición del router (createBrowserRouter)
├── store/
│   ├── authStore.ts        # Store Zustand de autenticación (persiste en localStorage)
│   └── index.ts            # Store Zustand de UI (sidebar)
├── index.css               # Variables de diseño + directivas Tailwind
├── App.tsx                 # Componente raíz (stub de bienvenida Vite — pendiente reemplazar)
└── main.tsx                # Entry point (QueryClientProvider + RouterProvider)
```

**Reglas de capas:**

- `components/ui/` ← componentes primitivos de UI, sin lógica de negocio.
- `components/` ← componentes compartidos entre features, sin llamadas API directas.
- `features/<dominio>/components/` ← componentes con lógica de negocio del dominio.
- `layouts/` ← wrappers de página; no contienen lógica de negocio.
- `store/` ← estado global Zustand; sin llamadas API directas (eso es responsabilidad de los componentes/hooks).

---

## 3. Variables de entorno

Las variables deben empezar con `VITE_` para ser expuestas al cliente.
Copiar `.env.example` → `.env` y ajustar. **Nunca hacer commit del `.env` real.**

| Variable       | Default dev             | Descripción                    |
| -------------- | ----------------------- | ------------------------------ |
| `VITE_API_URL` | `http://localhost:3000` | URL base de la API del backend |

> En desarrollo, si no se define `VITE_API_URL`, Axios usa `/api` y Vite
> hace proxy a `http://localhost:3000` (configurado en `vite.config.ts`).

---

## 4. Comandos esenciales

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (HMR en localhost:5173)
npm run dev

# Verificar tipos + build de producción
npm run build

# Preview del build de producción
npm run preview

# Linting (ESLint con TypeScript)
npm run lint

# Formatear código (Prettier)
npm run format

# Añadir un componente de shadcn/ui
npx shadcn@latest add <componente>
```

---

## 5. Rutas del router

| Path              | Layout       | Componente              | Auth          |
| ----------------- | ------------ | ----------------------- | ------------- |
| `/login`          | `AuthLayout` | `LoginForm`             | Pública       |
| `/register`       | `AuthLayout` | `RegisterForm`          | Pública       |
| `/check-email`    | `AuthLayout` | `CheckEmailDetail`      | Pública       |
| `/reset-password` | `AuthLayout` | `ResetPasswordForm`     | Pública       |
| `/new-password`   | `AuthLayout` | `NewPasswordForm`       | Pública       |
| `/verify-email`   | `AuthLayout` | `VerifyEmailDetail`     | Pública       |
| `/`               | `AppLayout`  | Dashboard (placeholder) | JWT requerido |
| `/profile`        | `AppLayout`  | `ProfileForm`           | JWT requerido |
| `*`               | —            | `Navigate to="/"`       | —             |

`ProtectedRoute` comprueba `useAuthStore.isAuthenticated`. Si es `false`,
redirige a `/login`. `AuthLayout` hace lo contrario: si está autenticado,
redirige a `/`.

---

## 6. Estado global (Zustand)

### `authStore.ts` — autenticación

```ts
useAuthStore.getState().login(token, user); // login + guardar en localStorage
useAuthStore.getState().logout(); // logout + limpiar localStorage
useAuthStore.getState().updateUser(partial); // actualizar campos del usuario
useAuthStore((s) => s.isAuthenticated); // boolean
useAuthStore((s) => s.user); // User | null
useAuthStore((s) => s.token); // string | null
```

El store **persiste manualmente** en `localStorage` (sin `zustand/middleware/persist`).
No usar `localStorage` directamente en componentes para datos de auth.

### `store/index.ts` — UI

```ts
useUIStore((s) => s.isSidebarOpen); // boolean
useUIStore.getState().toggleSidebar();
```

---

## 7. Cliente HTTP — Axios

Importar siempre la instancia centralizada:

```ts
import api from '@/lib/axios';

// GET
const { data } = await api.get('/auth/profile');

// POST
const { data } = await api.post('/auth/login', payload);
```

El interceptor de request inyecta el Bearer token desde `localStorage` automáticamente.
No crear instancias adicionales de Axios.

---

## 8. Formularios — React Hook Form + Zod

Patrón estándar de todos los formularios del proyecto:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    /* llamada API */
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
    </form>
  );
}
```

---

## 9. Componentes de shadcn/ui

Generados en `src/components/ui/`. Estilo configurado: `base-nova`.
Para añadir un nuevo componente:

```bash
npx shadcn@latest add <nombre>
# Ejemplo: npx shadcn@latest add dialog
```

Los componentes primitivos usan `@base-ui/react` (no `@radix-ui/react`).
Alias `@/` → `src/` configurado en `vite.config.ts` y `tsconfig.app.json`.

---

## 10. Convenciones de código

### TypeScript

- Strict mode activado. No usar `any` explícito.
- Siempre tipar las props de componentes (interfaz o `type`).
- Usar `unknown` en bloques `catch` y narrowing para acceder a propiedades.

### Componentes React

- Componentes como funciones nombradas (`export default function MyComponent`).
- Un archivo = un componente principal.
- Los componentes de feature van en `features/<dominio>/components/`.
- Los hooks personalizados van en `features/<dominio>/hooks/` o `src/hooks/`.

### Tailwind CSS

- Usar las clases semánticas del design system (`bg-background`, `text-foreground`,
  `border-border`, etc.). Evitar colores hardcodeados excepto el primario de marca.
- El color primario de marca es `#4648d4` (indigo‑700). Se usa directamente en
  los formularios; en el futuro debería moverse a la variable `--primary`.
- Para combinar clases condicionalmente: usar `cn()` de `@/lib/utils`.

### Commits

Conventional Commits validados por Commitlint + Husky:

```
feat: nueva funcionalidad
fix: corrección de bug
chore: mantenimiento
refactor: refactor sin cambio de comportamiento
style: cambios de formato/estilos
docs: solo documentación
test: tests
```

---

## 11. Checklist antes de hacer PR

- [ ] El build pasa sin errores (`npm run build`)
- [ ] No hay errores de lint (`npm run lint`)
- [ ] Los formularios tienen esquema Zod + manejo de errores visible
- [ ] Las rutas privadas nuevas están dentro de `ProtectedRoute`
- [ ] Los componentes de UI nuevos usan clases semánticas de Tailwind
- [ ] No se incluyen secrets ni `.env` reales
- [ ] El mensaje de commit sigue Conventional Commits
