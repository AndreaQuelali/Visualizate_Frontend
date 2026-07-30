import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { pricingPlans } from '../data/landingContent';

export default function PricingPreview() {
  return (
    <section
      id="precios"
      className="bg-background py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="mb-16 text-center">
          <h2 className="text-headline-lg text-foreground">
            Planes para todos los tamaños
          </h2>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl bg-card p-10 shadow-sm ${
                plan.featured
                  ? 'scale-100 border-2 border-primary shadow-xl shadow-primary/10 md:scale-105'
                  : 'border border-outline-variant'
              }`}
            >
              {plan.featured && plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  {plan.badge}
                </div>
              )}
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                {plan.name}
              </h3>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="font-medium text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <ul className="mb-10 flex-grow space-y-4">
                {plan.features.map((f) => (
                  <li
                    key={f.label}
                    className={`flex items-center gap-3 ${
                      f.included
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                    }`}
                  >
                    {f.included ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0" />
                    )}
                    {f.label}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={`block w-full rounded-xl py-3.5 text-center font-bold transition-all ${
                  plan.featured
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90'
                    : 'border border-outline-variant text-foreground hover:bg-surface-container'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
