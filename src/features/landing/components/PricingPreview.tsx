import { Link } from 'react-router-dom';
import { Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '../data/landingContent';
import { useReveal } from '../hooks/useReveal';

export default function PricingPreview() {
  const [ref, visible] = useReveal<HTMLElement>();

  return (
    <section
      id="precios"
      ref={ref}
      className="bg-background py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div
          className={`mb-12 text-center md:mb-16 ${
            visible ? 'reveal is-visible' : 'reveal'
          }`}
        >
          <p className="mb-3 font-mono text-label-sm uppercase tracking-widest text-primary">
            planes
          </p>
          <h2 className="font-display text-headline-lg text-foreground md:text-headline-xl">
            Planes para todos los tamaños
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
          {pricingPlans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl bg-card p-8 ${
                plan.featured
                  ? 'border-2 border-primary shadow-lg shadow-primary/10'
                  : 'border border-border'
              } ${visible ? 'reveal is-visible' : 'reveal'}`}
              style={{
                transitionDelay: visible ? `${80 + i * 70}ms` : undefined,
              }}
            >
              {plan.featured && plan.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-secondary px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-secondary-foreground">
                  {plan.badge}
                </span>
              )}
              <h3 className="mb-1 font-display text-xl font-semibold text-foreground">
                {plan.name}
              </h3>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="font-mono text-label-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <ul className="mb-8 flex-grow space-y-3 font-mono text-sm">
                {plan.features.map((f) => (
                  <li
                    key={f.label}
                    className={`flex items-center gap-2.5 ${
                      f.included
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                    }`}
                  >
                    {f.included ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {f.label}
                  </li>
                ))}
              </ul>
              <Button
                render={<Link to={plan.to} />}
                nativeButton={false}
                variant={plan.featured ? 'default' : 'outline'}
                className="h-auto w-full rounded-xl py-3 text-sm font-semibold"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
