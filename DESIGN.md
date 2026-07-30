# DESIGN.md — Sistema de Diseño Visualizate Frontend

> Referencia del sistema de diseño visual del proyecto Visualizate.
> Todos los agentes de IA y desarrolladores deben seguir estas guías al
> crear o modificar componentes de UI.

---

## 1. Filosofía de diseño

Visualizate es una herramienta profesional de creación de contenido visual.
El diseño de la interfaz debe transmitir:

- **Claridad** — jerarquía visual limpia, sin ruido.
- **Confianza** — colores sólidos, tipografía consistente, interacciones predecibles.
- **Modernidad** — uso de OKLCH, blur decorativo, micro-interacciones sutiles.
- **Adaptabilidad** — soporte nativo para modo claro y oscuro.

---

## 2. Sistema de colores

### 2.1 Token de marca

| Nombre        | Hex de referencia | OKLCH (en CSS)             | Uso                                      |
| ------------- | ----------------- | -------------------------- | ---------------------------------------- |
| Brand Primary | `#4648d4`         | `oklch(0.492 0.209 274.9)` | CTAs, focus rings, iconos, links activos |

`--primary` es el color de marca. En `index.css` se define en **OKLCH**. Usar
siempre `bg-primary` / `text-primary` / `ring-primary` — no hardcodear colores
en componentes.

### 2.2 Tokens semánticos (CSS variables OKLCH)

Definidos en `src/index.css` (`:root` claro / `.dark` oscuro) con `oklch(...)`.
Usar **siempre** estos tokens vía clases Tailwind.

#### Modo claro (`:root`)

| Token CSS              | Clase Tailwind                       | Descripción                          |
| ---------------------- | ------------------------------------ | ------------------------------------ |
| `--background`         | `bg-background`                      | Fondo de página                      |
| `--foreground`         | `text-foreground`                    | Texto principal                      |
| `--card`               | `bg-card`                            | Fondo de tarjetas                    |
| `--card-foreground`    | `text-card-foreground`               | Texto en tarjetas                    |
| `--muted`              | `bg-muted`                           | Fondo de inputs, secciones atenuadas |
| `--muted-foreground`   | `text-muted-foreground`              | Texto secundario/placeholder         |
| `--border`             | `border-border`                      | Bordes de componentes                |
| `--input`              | `border-input`                       | Borde específico de inputs           |
| `--ring`               | `ring-ring`                          | Focus ring estándar                  |
| `--primary`            | `bg-primary`, `text-primary`         | Acciones primarias / marca           |
| `--primary-foreground` | `text-primary-foreground`            | Texto sobre fondo primario           |
| `--secondary`          | `bg-secondary`                       | Acciones secundarias                 |
| `--destructive`        | `bg-destructive`, `text-destructive` | Errores, alertas críticas            |
| `--radius`             | `rounded-lg`                         | Radio base `0.625rem`                |

#### Modo oscuro (`.dark`)

Los mismos tokens se remapean en OKLCH. Usar siempre los tokens semánticos y
**no hardcodear** hex/oklch sueltos en la UI.

### 2.3 Colores de fondo de inputs

En formularios de autenticación se usan fondos específicos:

```
Claro: bg-[#f3f4f5]    (gris muy claro, diferencia el input del card blanco)
Oscuro: dark:bg-muted  (token semántico)
```

---

## 3. Tipografía

| Aspecto           | Valor                                               |
| ----------------- | --------------------------------------------------- |
| Familia principal | **Geist Variable** (`'Geist Variable', sans-serif`) |
| Importación       | `@fontsource-variable/geist` (en `index.css`)       |
| Token CSS         | `--font-sans`                                       |
| Clase Tailwind    | `font-sans` (aplicada en `html`)                    |
| Encabezados       | `--font-heading` = misma que `--font-sans`          |

**Nunca** importar fuentes adicionales de Google Fonts u otras fuentes.
Geist es la única fuente del proyecto.

### Escala tipográfica de uso frecuente

| Clase                   | Uso                                    |
| ----------------------- | -------------------------------------- |
| `text-2xl font-bold`    | Título de tarjeta principal (`h1`)     |
| `text-xl font-bold`     | Título secundario (`h2`)               |
| `text-sm`               | Texto de cuerpo, descripción           |
| `text-xs font-semibold` | Labels de formulario                   |
| `text-xs`               | Mensajes de error, helper text, footer |

---

## 4. Espaciado y layout

### Radio de borde

| Clase        | Valor                        | Uso                                   |
| ------------ | ---------------------------- | ------------------------------------- |
| `rounded-xl` | `0.75rem`                    | Tarjetas principales, botones grandes |
| `rounded-lg` | `var(--radius)` = `0.625rem` | Inputs, botones estándar              |
| `rounded-md` | `calc(var(--radius) - 2px)`  | Elementos intermedios                 |
| `rounded-sm` | `calc(var(--radius) - 4px)`  | Chips, badges                         |

### Contenedor de formulario de auth

Ancho máximo:

- Login: `max-w-[440px]`
- Registro: `max-w-[480px]`

Padding interno de tarjeta: `p-6 md:p-8`

---

## 5. Componentes de UI

### 5.1 Botón primario (CTA)

```tsx
<button
  type="submit"
  className="w-full py-2.5 bg-[#4648d4] text-white text-sm font-semibold rounded-lg
             shadow-lg shadow-[#4648d4]/20
             hover:bg-[#4648d4]/90 active:scale-[0.98] transition-all
             flex items-center justify-center gap-2
             disabled:opacity-75 disabled:cursor-not-allowed"
>
  Acción principal
</button>
```

### 5.2 Input de formulario

```tsx
<input
  className={`w-full px-3 py-2 pl-10 rounded-lg border
    bg-[#f3f4f5] dark:bg-muted text-foreground
    placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-[#4648d4]/10 focus:border-[#4648d4]
    transition-all text-sm
    ${error ? 'border-destructive' : 'border-border'}`}
/>
```

Con ícono a la izquierda del campo: añadir `relative` al wrapper y
`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground` al ícono.

### 5.3 Mensaje de error de bloque (API)

```tsx
<div className="mb-4 p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-r-lg">
  {errorMessage}
</div>
```

### 5.4 Mensaje de error inline (validación de campo)

```tsx
<p className="text-xs text-destructive px-1">{error.message}</p>
```

### 5.5 Label de campo

```tsx
<label
  className="text-xs font-semibold text-muted-foreground"
  htmlFor="fieldId"
>
  Nombre del campo
</label>
```

### 5.6 Tarjeta de formulario

```tsx
<div
  className="bg-white dark:bg-card border border-border p-6 md:p-8 rounded-xl
                shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.04)]"
>
  {/* contenido */}
</div>
```

### 5.7 Logo/marca de formulario auth

```tsx
<div className="flex flex-col items-center mb-8">
  <div
    className="w-12 h-12 bg-[#4648d4] rounded-xl flex items-center justify-center
                  mb-4 shadow-lg shadow-[#4648d4]/20 text-white"
  >
    {/* SVG del ícono */}
  </div>
  <h2 className="font-sans text-2xl font-bold text-[#4648d4] tracking-tight">
    Visualizate
  </h2>
</div>
```

### 5.8 Separador horizontal con texto

```tsx
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-border" />
  </div>
  <div className="relative flex justify-center text-xs">
    <span className="px-2 bg-white dark:bg-card text-muted-foreground font-semibold">
      O
    </span>
  </div>
</div>
```

### 5.9 Link de acción secundaria

```tsx
<Link
  to="/ruta"
  className="text-[#4648d4] font-semibold hover:underline transition-all"
>
  Texto del enlace
</Link>
```

---

## 6. Layout de autenticación

### Estructura del `AuthLayout`

- Fondo: `bg-slate-50 dark:bg-zinc-950`
- Elemento decorativo superior-izquierdo: `rounded-full bg-indigo-500/10 blur-[120px]`
- Elemento decorativo inferior-derecho: `rounded-full bg-[#4648d4]/10 blur-[120px]`
- Contenido centrado con `flex items-center justify-center min-h-screen`

```tsx
// Patrón de background con blur decorativo
<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
  <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#4648d4]/10 blur-[120px] pointer-events-none" />
  <div className="w-full flex justify-center items-center relative z-10">
    <Outlet />
  </div>
</div>
```

---

## 7. Layout principal (app autenticada)

### Estructura del `AppLayout`

```
┌─────────────────────────────────────────┐
│                 Header                   │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │      <main> (Outlet)         │
│          │      padding: p-6            │
│          │                              │
└──────────┴──────────────────────────────┘
```

- Fondo: `bg-background` (token semántico)
- Header y Sidebar son actualmente skeletons para implementar.

---

## 8. Animaciones y transiciones

| Clase                 | Efecto                                                    |
| --------------------- | --------------------------------------------------------- |
| `animate-fade-in`     | Fade de entrada (de `tw-animate-css`)                     |
| `transition-all`      | Transición general de propiedades CSS                     |
| `transition-colors`   | Transición solo de colores                                |
| `active:scale-[0.98]` | Feedback táctil en botones (escala ligeramente al pulsar) |
| `hover:underline`     | Subrayado en links al hover                               |

**Spinner de carga en botones:**

```tsx
<svg
  className="animate-spin h-5 w-5 text-white"
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
```

---

## 9. Iconografía

Librería: **Lucide React** (`lucide-react`).
Tamaño estándar dentro de inputs: `w-4 h-4`.
Tamaño en botones: `w-4 h-4`.

Íconos más usados en la feature de auth:

- `Mail` — campo de email
- `Lock` — campo de contraseña
- `User` — campo de nombre
- `Eye` / `EyeOff` — toggle visibilidad de contraseña
- `ArrowRight` — botón de login
- `CheckCircle` — checkmarks de requisitos de contraseña

**Coloreado dinámico con estado:**

```tsx
<CheckCircle
  className={`w-3.5 h-3.5 ${isValid ? 'fill-[#4648d4] text-white' : ''}`}
/>
```

---

## 10. Patrones visuales a mantener

### Checklist de requisitos de contraseña (RegisterForm)

Indica progresivamente qué requisitos se cumplen al escribir la contraseña:

```tsx
<div
  className={`flex items-center gap-1.5 text-xs transition-colors
  ${isValid ? 'text-[#4648d4]' : 'text-muted-foreground'}`}
>
  <CheckCircle
    className={`w-3.5 h-3.5 ${isValid ? 'fill-[#4648d4] text-white' : ''}`}
  />
  <span>Descripción del requisito</span>
</div>
```

### Toggle de visibilidad de contraseña

Botón `type="button"` con `Eye`/`EyeOff` de Lucide, absolutamente posicionado
en el borde derecho del input. No usar `input[type=button]`.

### Links de navegación entre pantallas auth

En el footer de cada tarjeta:

```tsx
<p className="text-xs text-muted-foreground">
  ¿No tienes cuenta?{' '}
  <Link
    to="/register"
    className="text-[#4648d4] font-semibold hover:underline transition-all"
  >
    Regístrate
  </Link>
</p>
```

---

## 11. Qué evitar (anti-patrones visuales)

| ❌ Evitar                                                     | ✅ Alternativa                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| `bg-blue-600`, `text-gray-500` (colores semánticos genéricos) | `bg-[#4648d4]`, `text-muted-foreground`                    |
| Fuentes diferentes de Geist                                   | Usar `font-sans` (Geist Variable)                          |
| Bordes con `rounded-full` en tarjetas                         | `rounded-xl` (visual más profesional)                      |
| Shadows muy pronunciadas                                      | Sombras sutiles `shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]` |
| Animaciones bruscas o largas                                  | `transition-all`, `duration-[200ms]` máximo                |
| Inputs sin estado de error visual                             | Siempre alternar `border-destructive` / `border-border`    |
| Mostrar mensajes de éxito con colores de error                | Usar `text-[#4648d4]` o `text-foreground` para éxito       |
