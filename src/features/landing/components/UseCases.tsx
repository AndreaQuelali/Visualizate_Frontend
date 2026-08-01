import { useCases } from '../data/landingContent';
import { useReveal } from '../hooks/useReveal';

export default function UseCases() {
  const [ref, visible] = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="bg-background py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div
          className={`mb-12 md:mb-16 ${visible ? 'reveal is-visible' : 'reveal'}`}
        >
          <p className="mb-3 font-mono text-label-sm uppercase tracking-widest text-primary">
            industrias
          </p>
          <h2 className="font-display text-headline-lg text-foreground md:text-headline-xl">
            Hecho para cada industria
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item, i) => (
            <div
              key={item.title}
              className={`group rounded-2xl border border-border bg-card p-7 transition-transform duration-300 hover:-translate-y-1 hover:border-primary/40 ${
                visible ? 'reveal is-visible' : 'reveal'
              }`}
              style={{
                transitionDelay: visible ? `${80 + i * 60}ms` : undefined,
              }}
            >
              <h3 className="mb-3 font-display text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-body-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
