import { howItWorks } from '../data/landingContent';

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="bg-surface-container-low py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-headline-lg text-foreground">
            El camino más corto al diseño
          </h2>
          <p className="mx-auto max-w-2xl text-body-lg text-muted-foreground">
            Nuestro flujo está diseñado para que te enfoques en la estrategia,
            no en los píxeles.
          </p>
        </div>
        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="absolute left-0 top-10 z-0 hidden h-0.5 w-full bg-primary/10 md:block dark:h-px dark:bg-gradient-to-r dark:from-transparent dark:via-white/10 dark:to-transparent" />
          {howItWorks.map((item) => (
            <div key={item.step} className="relative z-10 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-xl shadow-primary/20 md:h-16 md:w-16">
                {item.step}
              </div>
              <h4 className="mb-2 text-lg font-bold text-foreground">
                {item.title}
              </h4>
              <p className="px-4 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
