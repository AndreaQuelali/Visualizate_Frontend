import { useCases } from '../data/landingContent';

export default function UseCases() {
  return (
    <section className="bg-background py-section-gap md:py-section-gap-lg">
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="mb-16 text-center">
          <h2 className="text-headline-lg text-foreground">
            Hecho para cada industria
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-outline-variant bg-card p-8 transition-all hover:shadow-lg dark:border-white/5"
            >
              <h5 className="mb-4 text-lg font-bold text-primary">
                {item.title}
              </h5>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
