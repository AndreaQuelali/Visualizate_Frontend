import { features } from '../data/landingContent';

export default function FeaturesGrid() {
  return (
    <section
      id="caracteristicas"
      className="py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-headline-lg text-foreground">
            Todo lo que necesitas para escalar
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Potencia tu flujo de trabajo con herramientas diseñadas para la
            eficiencia.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-outline-variant bg-card p-8 shadow-sm transition-all hover:border-primary dark:border-white/5 dark:hover:border-primary/30"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-body-md text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
