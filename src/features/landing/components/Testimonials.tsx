import { useEffect, useState } from 'react';
import { testimonials } from '../data/landingContent';
import { useReveal } from '../hooks/useReveal';

export default function Testimonials() {
  const [ref, visible] = useReveal<HTMLElement>();
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      ref={ref}
      className="bg-surface-container-lowest py-section-gap md:py-section-gap-lg"
    >
      <div
        className={`mx-auto max-w-3xl px-gutter text-center ${
          visible ? 'reveal is-visible' : 'reveal'
        }`}
      >
        <p className="mb-8 font-mono text-label-sm uppercase tracking-widest text-primary">
          voz de clientes
        </p>
        <blockquote className="mb-8 font-display text-headline-lg text-foreground md:text-headline-xl">
          &ldquo;{current.quote}&rdquo;
        </blockquote>
        <div className="mb-8">
          <p className="font-semibold text-foreground">{current.name}</p>
          <p className="font-mono text-label-sm uppercase tracking-wider text-muted-foreground">
            {current.role}
          </p>
        </div>
        <div className="flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver testimonio ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                i === index
                  ? 'w-6 bg-secondary'
                  : 'w-2 bg-border hover:bg-muted-foreground/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
