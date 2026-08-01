import { Link } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';

export default function FinalCta() {
  const [ref, visible] = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="atmosphere relative overflow-hidden py-section-gap md:py-section-gap-lg"
    >
      <div className="pointer-events-none absolute inset-0 bg-primary" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary via-primary to-[oklch(0.4_0.18_275)] opacity-90" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div
        className={`relative z-10 mx-auto max-w-container-max px-gutter text-center ${
          visible ? 'reveal is-visible' : 'reveal'
        }`}
      >
        <h2 className="mb-5 font-display text-headline-xl text-white md:text-display-hero-mobile">
          Empieza a automatizar hoy
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-body-lg text-white/80">
          Únete a equipos que ya escalan su producción gráfica con Visualizate.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[oklch(0.16_0_0)] shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            Empieza gratis ahora
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            Hablar con expertos
          </Link>
        </div>
      </div>
    </section>
  );
}
