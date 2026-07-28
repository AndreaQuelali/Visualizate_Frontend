# CLAUDE.md — Visualizate Frontend

> Instrucciones específicas para **Claude** (y asistentes compatibles) al trabajar
> en este repositorio. Complementa `AGENTS.md` y `DESIGN.md`; léelos todos.

---

## Contexto del proyecto

Frontend SPA de **Visualizate**, plataforma de creación de contenido visual.
Stack: **React 19 · TypeScript · Vite 8 · Tailwind CSS 3 · React Router DOM v7 ·
Zustand v5 · TanStack Query v5 · React Hook Form v7 · Zod v4 · shadcn/ui (base-nova)**.

El flujo de autenticación está completamente implementado. Las pantallas de la
app principal (dashboard, editor de contenido visual) están pendientes.

---

## Cómo explorar el código antes de responder

1. Leer `AGENTS.md` (arquitectura, capas, rutas, estado).
2. Leer `DESIGN.md` (sistema de diseño, paleta, tipografía, patrones visuales).
3. Para entender una feature: ir a `src/features/<dominio>/components/`.
4. Para entender el routing: `src/routes/index.tsx`.
5. Para entender el estado de auth: `src/store/authStore.ts`.
6. Para entender cómo se llama al API: `src/lib/axios.ts` + cualquier componente de feature.

---

## Reglas de generación de código

### ✅ Siempre hacer

- **TypeScript estricto**: tipos explícitos, sin `any`. En bloque `catch`, usar
  `unknown` + narrowing de tipo antes de acceder a `.response`, `.message`, etc.
- **Importar `api`** desde `@/lib/axios` para todas las llamadas HTTP.
- **Importar `useAuthStore`** desde `@/store/authStore` para datos de sesión.
- **Usar `cn()`** de `@/lib/utils` para combinar clases Tailwind condicionales.
- **Esquema Zod** para cada formulario nuevo, con mensajes de error en español.
- **Clases semánticas de Tailwind** (`bg-background`, `text-foreground`,
  `border-border`, `text-muted-foreground`, etc.) en lugar de colores hardcodeados.
- Mostrar **estados de carga, error y vacío** en todos los formularios e interacciones
  async que se generen.
- Usar la **fuente Geist** (ya importada globalmente) — no importar otras fuentes.

### ❌ Nunca hacer

- `import axios from 'axios'` directamente — usar la instancia `@/lib/axios`.
- Leer `localStorage.getItem('token')` en componentes — usar `useAuthStore`.
- Crear instancias de `QueryClient` fuera de `main.tsx`.
- Usar colores Tailwind hardcodeados (`bg-blue-600`) para elementos de UI genéricos;
  reservar `#4648d4` solo para elementos de marca específicos.
- Usar `@radix-ui/react-*` directamente — shadcn usa `@base-ui/react`.
- Poner lógica de negocio en layouts o en componentes de `components/ui/`.
- Ignorar el resultado de promesas sin manejo de error.

---

## Patrones de código estándar

### Componente de Feature con llamada API

```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});
type FormValues = z.infer<typeof schema>;

export default function MyFeatureForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/resource', data);
      // navegar o actualizar el estado
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message ?? 'Error inesperado. Inténtalo de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-r-lg">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <label
          className="text-xs font-semibold text-muted-foreground"
          htmlFor="name"
        >
          Nombre
        </label>
        <input
          id="name"
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-muted text-foreground text-sm',
            'focus:outline-none focus:ring-2 focus:ring-[#4648d4]/10 focus:border-[#4648d4] transition-all',
            errors.name ? 'border-destructive' : 'border-border',
          )}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-destructive px-1">{errors.name.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-[#4648d4] text-white text-sm font-semibold rounded-lg
                   hover:bg-[#4648d4]/90 active:scale-[0.98] transition-all
                   disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

### Nueva ruta privada

```tsx
// En src/routes/index.tsx, dentro del bloque ProtectedRoute > AppLayout > children:
{ path: 'nueva-ruta', element: <MiNuevoComponente /> }
```

### Nueva ruta pública de auth

```tsx
// En src/routes/index.tsx, dentro del bloque AuthLayout > children:
{ path: 'nueva-auth', element: <NuevoFormAuth /> }
```

### Agregar un componente de shadcn/ui

```bash
npx shadcn@latest add <nombre>
# El componente se genera en src/components/ui/<nombre>.tsx
```

### Añadir un nuevo store Zustand

```ts
// src/store/myDomainStore.ts
import { create } from 'zustand';

interface MyState {
  value: string;
  setValue: (v: string) => void;
}

export const useMyStore = create<MyState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

---

## Diseño — resumen rápido

> Ver `DESIGN.md` para la guía completa.

- **Color de marca**: `#4648d4` (indigo vibrante).
- **Tipografía**: Geist Variable — sans-serif moderno, ya cargado globalmente.
- **Modo oscuro**: clases `.dark` con variables CSS OKLCH. Los tokens
  `bg-background`, `text-foreground`, etc. funcionan en ambos modos automáticamente.
- **Inputs**: fondo `bg-muted` (`bg-[#f3f4f5]` en claro), borde `border-border`,
  focus ring `ring-[#4648d4]/10`, border focus `border-[#4648d4]`.
- **Error feedback**: franja `border-l-4 border-destructive bg-destructive/10` para
  errores de bloque; `text-xs text-destructive` para mensajes inline de campo.
- **Botón primario**: `bg-[#4648d4] text-white hover:bg-[#4648d4]/90 active:scale-[0.98]`.
- **Cards de formulario**: `bg-white dark:bg-card border border-border rounded-xl shadow-*`.
- **AuthLayout**: fondo con blurs decorativos indigo/[#4648d4] en esquinas opuestas.
- Las animaciones de entrada usan la clase `animate-fade-in` de `tw-animate-css`.

---

## Checklist rápido al generar código

```
□ ¿TypeScript sin `any`? ¿`unknown` + narrowing en catch?
□ ¿Axios centralizado desde `@/lib/axios`?
□ ¿Estado global de auth desde `useAuthStore`, no localStorage directo?
□ ¿Clases semánticas de Tailwind?
□ ¿Esquema Zod con mensajes en español?
□ ¿Estados de carga y error implementados?
□ ¿`cn()` para clases condicionales?
□ ¿Ruta privada dentro de ProtectedRoute?
```
