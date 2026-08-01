import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { hero } from '../data/landingContent';
import FormatCanvas from './FormatCanvas';

export default function HeroSection() {
  const [ready, setReady] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (ready) return;
    const id = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(id);
  }, [ready]);

  return (
    <section className="atmosphere atmosphere-light relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="hero-gradient pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto grid max-w-container-max grid-cols-1 items-center gap-12 px-gutter lg:grid-cols-2 lg:gap-16">
        <div className="text-left">
          <p
            className={`mb-5 font-mono text-label-sm uppercase tracking-widest text-primary ${
              ready ? 'hero-enter' : 'opacity-0'
            }`}
            style={ready ? { animationDelay: '0ms' } : undefined}
          >
            {hero.eyebrow}
          </p>
          <h1
            className={`mb-6 font-display text-display-hero-mobile text-foreground md:text-display-hero ${
              ready ? 'hero-enter' : 'opacity-0'
            }`}
            style={ready ? { animationDelay: '100ms' } : undefined}
          >
            {hero.titleLine1}
            <br />
            <span className="text-gradient-brand">{hero.titleHighlight}</span>
          </h1>
          <p
            className={`mb-8 max-w-lg text-body-lg text-muted-foreground ${
              ready ? 'hero-enter' : 'opacity-0'
            }`}
            style={ready ? { animationDelay: '180ms' } : undefined}
          >
            {hero.subtitle}
          </p>
          <div
            className={`flex flex-col gap-3 sm:flex-row ${
              ready ? 'hero-enter' : 'opacity-0'
            }`}
            style={ready ? { animationDelay: '260ms' } : undefined}
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/80 px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver cómo funciona
              <PlayCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <FormatCanvas assembled={ready} />
      </div>
    </section>
  );
}
