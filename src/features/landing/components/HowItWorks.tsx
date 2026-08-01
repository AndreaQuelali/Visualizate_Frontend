import { howItWorks } from '../data/landingContent';
import { useReveal } from '../hooks/useReveal';

export default function HowItWorks() {
  const [ref, visible] = useReveal<HTMLElement>();

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="bg-surface-container-low py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div
          className={`mb-14 max-w-2xl md:mb-20 ${
            visible ? 'reveal is-visible' : 'reveal'
          }`}
        >
          <p className="mb-3 font-mono text-label-sm uppercase tracking-widest text-primary">
            pipeline
          </p>
          <h2 className="font-display text-headline-lg text-foreground md:text-headline-xl">
            El camino más corto al diseño
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Cuatro pasos. Orden importa: datos primero, export al final.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-border md:block" />
          <div
            className={`pipeline-progress absolute left-0 top-5 hidden h-px w-full bg-primary md:block ${
              visible ? 'is-visible' : ''
            }`}
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
            {howItWorks.map((item, i) => (
              <div
                key={item.step}
                className={`relative ${visible ? 'reveal is-visible' : 'reveal'}`}
                style={{
                  transitionDelay: visible ? `${100 + i * 80}ms` : undefined,
                }}
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-background font-mono text-xs font-semibold text-primary md:relative md:z-10">
                  {item.step}
                </div>
                <p className="mb-2 font-mono text-label-sm uppercase tracking-widest text-muted-foreground">
                  paso {item.step} · {item.title}
                </p>
                <p className="text-body-sm text-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
