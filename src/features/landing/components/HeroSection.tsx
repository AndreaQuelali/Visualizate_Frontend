import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { hero } from '../data/landingContent';

export default function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden pb-20 pt-40 md:pb-24 md:pt-48">
      <div className="relative z-10 mx-auto max-w-container-max px-gutter text-center">
        <span className="mb-6 inline-block rounded-full border border-primary/20 bg-primary-fixed px-4 py-1.5 text-label-sm font-semibold uppercase tracking-wide text-on-primary-fixed-variant dark:text-primary">
          {hero.badge}
        </span>
        <h1 className="mx-auto mb-6 max-w-4xl text-display-hero-mobile tracking-tight text-foreground md:text-display-hero">
          {hero.titleBefore}
          <span className="text-gradient">{hero.titleHighlight}</span>
          {hero.titleAfter}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-body-lg text-muted-foreground">
          {hero.subtitle}
        </p>
        <div className="mb-16 flex flex-col justify-center gap-4 md:mb-20 md:flex-row">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            Comenzar gratis
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#caracteristicas"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container px-8 py-4 text-lg font-bold text-foreground transition-colors hover:bg-surface-variant"
          >
            Ver demostración
            <PlayCircle className="h-5 w-5" />
          </a>
        </div>
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-3xl dark:bg-gradient-to-r dark:from-primary/20 dark:to-secondary/20 dark:blur-2xl" />
          <div className="soft-card relative overflow-hidden rounded-2xl border border-outline-variant dark:border-white/10">
            <img
              src={hero.dashboardSrc}
              alt={hero.dashboardAlt}
              className="aspect-[16/9] w-full object-cover"
              width={1280}
              height={720}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
