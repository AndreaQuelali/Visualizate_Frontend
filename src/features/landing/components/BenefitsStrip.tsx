import { benefits } from '../data/landingContent';

export default function BenefitsStrip() {
  return (
    <section className="border-y border-outline-variant bg-primary-fixed/30 py-20 dark:bg-primary/5 md:py-24">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-12 px-gutter md:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div key={benefit.title} className="flex items-start gap-5">
              <Icon className="h-9 w-9 shrink-0 fill-primary/20 text-primary" />
              <div>
                <h4 className="mb-2 text-xl font-bold text-foreground">
                  {benefit.title}
                </h4>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
