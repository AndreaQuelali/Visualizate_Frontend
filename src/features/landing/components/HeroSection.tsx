import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
            <Button
              render={<Link to="/register" />}
              nativeButton={false}
              className="h-auto gap-2 rounded-xl px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/25 hover:-translate-y-0.5"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              render={<a href="#como-funciona" />}
              nativeButton={false}
              variant="outline"
              className="h-auto gap-2 rounded-xl bg-card/80 px-7 py-3.5 text-base font-semibold backdrop-blur-sm"
            >
              Ver cómo funciona
              <PlayCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <FormatCanvas assembled={ready} />
      </div>
    </section>
  );
}
