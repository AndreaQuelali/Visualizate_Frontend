import { featuredFeatures, compactFeatures } from '../data/landingContent';
import { useReveal } from '../hooks/useReveal';

export default function FeaturesGrid() {
  const [ref, visible] = useReveal<HTMLElement>();

  return (
    <section
      id="caracteristicas"
      ref={ref}
      className="py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div
          className={`mb-12 max-w-2xl md:mb-16 ${
            visible ? 'reveal is-visible' : 'reveal'
          }`}
        >
          <p className="mb-3 font-mono text-label-sm uppercase tracking-widest text-primary">
            capacidades
          </p>
          <h2 className="font-display text-headline-lg text-foreground md:text-headline-xl">
            Todo lo que necesitas para escalar producción visual
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {featuredFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group soft-card rounded-2xl p-8 transition-colors hover:border-primary/40 ${
                  visible ? 'reveal is-visible' : 'reveal'
                }`}
                style={{
                  transitionDelay: visible ? `${80 + i * 60}ms` : undefined,
                }}
              >
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-3 font-display text-headline-md text-foreground">
                  {feature.title}
                </h3>
                <p className="text-body-md text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {compactFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className={`group bg-card p-6 transition-colors hover:bg-muted ${
                  visible ? 'reveal is-visible' : 'reveal'
                }`}
                style={{
                  transitionDelay: visible ? `${200 + i * 50}ms` : undefined,
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-body-sm text-muted-foreground">
                  {feature.description}
                </p>
                <span className="mt-4 block h-px w-0 bg-primary transition-all duration-300 group-hover:w-8" />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
