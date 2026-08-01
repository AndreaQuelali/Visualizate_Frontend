import { bentoCells } from '../data/landingContent';
import { useReveal } from '../hooks/useReveal';

export default function ProductShowcase() {
  const [ref, visible] = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="overflow-hidden bg-background py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div
          className={`mb-12 md:mb-16 ${visible ? 'reveal is-visible' : 'reveal'}`}
        >
          <p className="mb-3 font-mono text-label-sm uppercase tracking-widest text-primary">
            formatos
          </p>
          <h2 className="font-display text-headline-lg text-foreground md:text-headline-xl">
            Resultados de nivel profesional
          </h2>
        </div>

        <div className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[160px] sm:gap-4 md:auto-rows-[180px] md:grid-cols-4 md:gap-5 lg:auto-rows-[200px]">
          {bentoCells.map((cell, i) => (
            <div
              key={`${cell.label}-${i}`}
              className={`soft-card relative overflow-hidden rounded-2xl ${cell.tone} ${cell.span} ${
                visible ? 'reveal is-visible' : 'reveal'
              }`}
              style={{
                transitionDelay: visible ? `${60 + i * 50}ms` : undefined,
              }}
            >
              <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {cell.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
