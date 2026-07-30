import type { LucideIcon } from 'lucide-react';
import {
  Sparkles,
  Zap,
  Calendar,
  Users,
  FolderArchive,
  BadgeCheck,
  Timer,
  MousePointerClick,
  TrendingUp,
} from 'lucide-react';

export const navLinks = [
  { label: 'Inicio', href: '#' },
  { label: 'Características', href: '#caracteristicas' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Precios', href: '#precios' },
] as const;

export const features: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Sparkles,
    title: 'Plantillas dinámicas',
    description:
      'Crea layouts que se adaptan automáticamente al contenido sin perder el balance visual.',
  },
  {
    icon: Zap,
    title: 'Generación automática',
    description:
      'Conecta tus fuentes de datos y genera cientos de piezas gráficas en un solo clic.',
  },
  {
    icon: Calendar,
    title: 'Gestión de eventos',
    description:
      'Organiza la producción visual de tus eventos recurrentes de forma centralizada.',
  },
  {
    icon: Users,
    title: 'Organización de equipos',
    description:
      'Roles personalizados y flujos de aprobación para equipos creativos modernos.',
  },
  {
    icon: FolderArchive,
    title: 'Biblioteca de assets',
    description:
      'Mantén tu marca consistente con un repositorio central de logos, fuentes y colores.',
  },
  {
    icon: BadgeCheck,
    title: 'Exportación Pro',
    description:
      'Exporta en múltiples formatos (PNG, JPG, PDF) con resolución optimizada para cada canal.',
  },
];

export const howItWorks = [
  {
    step: 1,
    title: 'Formulario',
    description: 'Ingresa los datos, textos e imágenes de tu diseño.',
  },
  {
    step: 2,
    title: 'Plantilla',
    description: 'Elige entre cientos de layouts optimizados para conversión.',
  },
  {
    step: 3,
    title: 'Generación',
    description: 'La plataforma procesa y aplica el estilo en milisegundos.',
  },
  {
    step: 4,
    title: 'Descarga',
    description: 'Obtén tu pieza gráfica en alta calidad lista para compartir.',
  },
];

export const logos = [
  { src: '/landing/logo-1.png', alt: 'Logo de socio 1' },
  { src: '/landing/logo-2.png', alt: 'Logo de socio 2' },
  { src: '/landing/logo-3.png', alt: 'Logo de socio 3' },
  { src: '/landing/logo-4.png', alt: 'Logo de socio 4' },
  { src: '/landing/logo-5.png', alt: 'Logo de socio 5' },
];

export const showcaseColumns: {
  offsetClass: string;
  items: { src: string; alt: string; aspect: string }[];
}[] = [
  {
    offsetClass: '',
    items: [
      {
        src: '/landing/showcase-1.jpg',
        alt: 'Diseño de publicación para redes sociales',
        aspect: 'aspect-[4/5]',
      },
      {
        src: '/landing/showcase-2.jpg',
        alt: 'Flyer de webinar',
        aspect: 'aspect-[3/4]',
      },
    ],
  },
  {
    offsetClass: 'mt-12 md:mt-24',
    items: [
      {
        src: '/landing/showcase-3.jpg',
        alt: 'Certificado digital',
        aspect: 'aspect-[1.4/1]',
      },
      {
        src: '/landing/showcase-4.jpg',
        alt: 'Historia de Instagram',
        aspect: 'aspect-[9/16]',
      },
    ],
  },
  {
    offsetClass: '',
    items: [
      {
        src: '/landing/showcase-5.jpg',
        alt: 'Miniatura de YouTube',
        aspect: 'aspect-[16/9]',
      },
      {
        src: '/landing/showcase-6.jpg',
        alt: 'Tarjeta de presentación',
        aspect: 'aspect-[1.6/1]',
      },
    ],
  },
  {
    offsetClass: 'mt-6 md:mt-12',
    items: [
      {
        src: '/landing/showcase-7.jpg',
        alt: 'Banner de LinkedIn',
        aspect: 'aspect-[3/1]',
      },
      {
        src: '/landing/showcase-8.jpg',
        alt: 'Diapositiva de presentación',
        aspect: 'aspect-[4/3]',
      },
    ],
  },
];

export const benefits: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Timer,
    title: 'Ahorra tiempo',
    description:
      'Reduce en un 90% el tiempo dedicado a tareas repetitivas de diseño.',
  },
  {
    icon: MousePointerClick,
    title: 'Reduce errores',
    description:
      'Elimina los fallos humanos al automatizar la entrada de datos en los diseños.',
  },
  {
    icon: TrendingUp,
    title: 'Escala la creación',
    description:
      'Genera contenido masivo para todas tus plataformas sin aumentar presupuesto.',
  },
];

export const useCases = [
  {
    title: 'Comunidades Tech',
    description:
      'Flyers de eventos, certificados para alumnos y posts de redes sociales automáticos.',
  },
  {
    title: 'Empresas B2B',
    description:
      'Reportes visuales dinámicos, presentaciones y propuestas comerciales profesionales.',
  },
  {
    title: 'Agencias Marketing',
    description:
      'Escala la producción de anuncios pagados y contenido diario para múltiples clientes.',
  },
  {
    title: 'Educación Online',
    description:
      'Material didáctico, miniaturas para cursos y diplomas automáticos para egresados.',
  },
];

export const testimonials = [
  {
    quote:
      'Visualizate ha transformado por completo cómo manejamos los anuncios de nuestra comunidad. Lo que antes tomaba horas ahora se hace en segundos.',
    name: 'Elena Rodriguez',
    role: 'Community Lead @ TechHub',
    avatar: '/landing/avatar-elena.jpg',
  },
  {
    quote:
      'La calidad de las plantillas es excepcional. No parece contenido automatizado, tiene un toque humano y profesional increíble.',
    name: 'Marco Sanabria',
    role: 'Creative Director @ FlowAgency',
    avatar: '/landing/avatar-marco.jpg',
  },
  {
    quote:
      'Es la herramienta definitiva para escalar contenido sin quemar al equipo de diseño. La integración con nuestros datos fue súper sencilla.',
    name: 'Andrés Vidal',
    role: 'Founder @ SaaS Growth',
    avatar: '/landing/avatar-andres.jpg',
  },
];

export const pricingPlans = [
  {
    name: 'Gratis',
    price: '$0',
    period: '/mes',
    featured: false,
    features: [
      { label: '5 piezas al mes', included: true },
      { label: 'Plantillas básicas', included: true },
      { label: 'Exportación 4K', included: false },
    ],
    cta: 'Empezar ahora',
    to: '/register',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mes',
    featured: true,
    badge: 'Recomendado',
    features: [
      { label: 'Piezas ilimitadas', included: true },
      { label: 'Todas las plantillas Pro', included: true },
      { label: 'Exportación 4K y Vector', included: true },
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
      { label: 'SSO y seguridad Pro', included: true },
      { label: 'API de marca blanca', included: true },
      { label: 'Account Manager', included: true },
    ],
    cta: 'Contactar ventas',
    to: '/register',
  },
];

export const faqs = [
  {
    question: '¿Puedo usar mis propias fuentes y logos?',
    answer:
      'Sí, en los planes Pro y Enterprise puedes subir todo el kit de marca de tu empresa para que Visualizate mantenga la coherencia visual en cada diseño generado.',
  },
  {
    question: '¿Cómo funciona la integración de datos?',
    answer:
      'Puedes importar datos desde hojas de cálculo (CSV, Excel), conectar via API o usar nuestros formularios integrados para cargar la información.',
  },
  {
    question: '¿Hay un límite de exportación?',
    answer:
      'El plan gratuito tiene un límite de 5 piezas mensuales. El plan Pro ofrece exportaciones ilimitadas en alta calidad.',
  },
];

export const hero = {
  badge: 'Lanzamiento V2.0',
  titleBefore: 'Convierte datos en ',
  titleHighlight: 'contenido visual',
  titleAfter: ' automáticamente',
  subtitle:
    'Utiliza plantillas dinámicas inteligentes para escalar tu producción gráfica. Diseña una vez, genera miles de variaciones en segundos.',
  dashboardSrc: '/landing/hero-dashboard.jpg',
  dashboardAlt:
    'Interfaz del dashboard de Visualizate con lienzo y plantilla dinámica',
};
