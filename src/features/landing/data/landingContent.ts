import type { LucideIcon } from 'lucide-react';
import {
  Sparkles,
  Zap,
  Calendar,
  Users,
  FolderArchive,
  BadgeCheck,
} from 'lucide-react';

export const navLinks = [
  { label: 'Inicio', href: '#' },
  { label: 'Características', href: '#caracteristicas' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Precios', href: '#precios' },
] as const;

export const hero = {
  eyebrow: 'producción visual · v2.0',
  titleLine1: 'Diseña una vez.',
  titleHighlight: 'Genera mil piezas.',
  subtitle:
    'Plantillas dinámicas que se llenan con tus datos. Un layout, cientos de variaciones listas para publicar.',
};

export const canvasFormats = [
  { id: '1:1', label: '1:1', aspect: '1 / 1', spec: '1080×1080 · POST' },
  { id: '4:5', label: '4:5', aspect: '4 / 5', spec: '1080×1350 · FEED' },
  { id: '9:16', label: '9:16', aspect: '9 / 16', spec: '1080×1920 · STORY' },
  { id: '16:9', label: '16:9', aspect: '16 / 9', spec: '1920×1080 · YT' },
] as const;

export const canvasLabels = [
  {
    key: 'titulo',
    values: ['Meetup React', 'Webinar SaaS', 'Demo Day', 'Launch Party'],
  },
  { key: 'fecha', values: ['12 AGO', '03 SEP', '21 OCT', '05 NOV'] },
  {
    key: 'formato',
    values: ['PNG · 2×', 'JPG · 4K', 'PDF · print', 'SVG · vector'],
  },
] as const;

export const featuredFeatures: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Sparkles,
    title: 'Plantillas dinámicas',
    description:
      'Layouts que se reequilibran solos cuando cambia el texto, la imagen o el idioma. Diseñas la estructura una vez.',
  },
  {
    icon: Zap,
    title: 'Generación automática',
    description:
      'Conecta una hoja, un CSV o un formulario. Un clic y salen cientos de piezas listas para cada canal.',
  },
];

export const compactFeatures: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Calendar,
    title: 'Gestión de eventos',
    description: 'Producción visual centralizada para eventos recurrentes.',
  },
  {
    icon: Users,
    title: 'Equipos y roles',
    description: 'Aprobaciones y permisos para equipos creativos.',
  },
  {
    icon: FolderArchive,
    title: 'Biblioteca de marca',
    description: 'Logos, tipografías y colores en un solo lugar.',
  },
  {
    icon: BadgeCheck,
    title: 'Exportación Pro',
    description: 'PNG, JPG y PDF optimizados por canal.',
  },
];

export const howItWorks = [
  {
    step: '01',
    title: 'datos',
    description: 'Ingresa textos, imágenes y campos desde formulario o CSV.',
  },
  {
    step: '02',
    title: 'plantilla',
    description: 'Elige un layout pensado para el formato que vas a publicar.',
  },
  {
    step: '03',
    title: 'generación',
    description: 'Visualizate aplica estilo y composición en milisegundos.',
  },
  {
    step: '04',
    title: 'export',
    description: 'Descarga en alta calidad, lista para cada red o canal.',
  },
];

export const stats = [
  {
    value: '−90%',
    label: 'Tiempo dedicado a diseño repetitivo',
  },
  {
    value: '∞',
    label: 'Variaciones por plantilla dinámica',
  },
  {
    value: '0',
    label: 'Errores de captura de datos',
  },
] as const;

export const bentoCells = [
  {
    span: 'col-span-2 row-span-2',
    label: '4:5 · FEED',
    tone: 'bg-surface-container',
  },
  {
    span: 'row-span-2',
    label: '9:16 · STORY',
    tone: 'bg-surface-container-low',
  },
  { span: '', label: '1:1 · POST', tone: 'bg-surface-variant' },
  { span: '', label: '16:9 · YT', tone: 'bg-surface-container' },
  {
    span: 'col-span-2',
    label: '3:1 · BANNER',
    tone: 'bg-surface-container-low',
  },
  { span: '', label: '4:3 · SLIDE', tone: 'bg-surface-variant' },
  { span: '', label: '1.6:1 · CARD', tone: 'bg-surface-container' },
  {
    span: 'col-span-2 md:col-span-4',
    label: 'WIDE · COVER',
    tone: 'bg-surface-container-low',
  },
] as const;

export const useCases = [
  {
    title: 'Comunidades Tech',
    description:
      'Flyers de eventos, certificados y posts de redes — generados desde la misma lista de asistencia.',
  },
  {
    title: 'Empresas B2B',
    description:
      'Reportes visuales, presentaciones y propuestas con datos que ya viven en tu CRM.',
  },
  {
    title: 'Agencias',
    description:
      'Escala anuncios y contenido diario para varios clientes sin multiplicar el equipo.',
  },
  {
    title: 'Educación online',
    description:
      'Miniaturas de cursos, material didáctico y diplomas automáticos al egresar.',
  },
];

export const testimonials = [
  {
    quote:
      'Lo que antes tomaba horas de diseño ahora sale en segundos. Misma marca, mil variaciones.',
    name: 'Elena Rodriguez',
    role: 'Community Lead · TechHub',
  },
  {
    quote:
      'Las plantillas no se sienten automáticas. Tienen peso visual y coherencia de marca.',
    name: 'Marco Sanabria',
    role: 'Creative Director · FlowAgency',
  },
  {
    quote:
      'Escalamos contenido sin quemar al equipo. La integración con nuestros datos fue directa.',
    name: 'Andrés Vidal',
    role: 'Founder · SaaS Growth',
  },
];

export const pricingPlans = [
  {
    name: 'Gratis',
    price: '$0',
    period: '/mes',
    featured: false,
    features: [
      { label: '5 piezas / mes', included: true },
      { label: 'Plantillas básicas', included: true },
      { label: 'Export 4K', included: false },
    ],
    cta: 'Empezar ahora',
    to: '/register',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mes',
    featured: true,
    badge: 'recomendado',
    features: [
      { label: 'Piezas ilimitadas', included: true },
      { label: 'Plantillas Pro', included: true },
      { label: 'Export 4K + vector', included: true },
      { label: 'Soporte prioritario', included: true },
    ],
    cta: 'Comenzar Pro',
    to: '/register',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    featured: false,
    features: [
      { label: 'SSO y seguridad', included: true },
      { label: 'API marca blanca', included: true },
      { label: 'Account manager', included: true },
    ],
    cta: 'Contactar ventas',
    to: '/register',
  },
];

export const faqs = [
  {
    question: '¿Puedo usar mis propias fuentes y logos?',
    answer:
      'Sí. En Pro y Enterprise subes el kit de marca completo para que cada pieza mantenga tipografía, color y logos.',
  },
  {
    question: '¿Cómo entra la data?',
    answer:
      'CSV, Excel, API o formularios integrados. Tú eliges la fuente; Visualizate aplica la plantilla.',
  },
  {
    question: '¿Hay límite de exportación?',
    answer:
      'El plan gratis: 5 piezas al mes. Pro: exportaciones ilimitadas en alta calidad.',
  },
];
