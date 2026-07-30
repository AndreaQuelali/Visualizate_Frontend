import { Link } from 'react-router-dom';

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-card py-section-gap md:py-section-gap-lg">
      <div className="absolute inset-0 bg-primary/5 opacity-30 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-container-max px-gutter text-center">
        <h2 className="mb-6 text-headline-xl text-foreground md:text-display-hero-mobile">
          Empieza a automatizar hoy mismo
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-body-lg text-muted-foreground">
          Únete a cientos de equipos que ya están escalando su producción
          gráfica con Visualizate.
        </p>
        <div className="flex flex-col justify-center gap-4 md:flex-row">
          <Link
            to="/register"
            className="rounded-xl bg-primary px-10 py-4 text-xl font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            Empieza gratis ahora
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-outline-variant bg-surface-container px-10 py-4 text-xl font-bold text-foreground transition-colors hover:bg-surface-variant"
          >
            Hablar con expertos
          </Link>
        </div>
      </div>
    </section>
  );
}
