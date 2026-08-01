import { stats } from '../data/landingContent';
import { useReveal } from '../hooks/useReveal';

export default function BenefitsStrip() {
  const [ref, visible] = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`atmosphere relative overflow-hidden py-20 text-white md:py-28 ${
        visible ? 'reveal is-visible' : 'reveal'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[oklch(0.1_0.02_275)]" />
      <div className="relative z-10 mx-auto max-w-container-max px-gutter">
        <p className="mb-12 text-center font-mono text-label-sm uppercase tracking-[0.2em] text-white/50">
          Visualizate en números
        </p>
        <div className="grid grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col items-center px-6 py-8 text-center md:py-4"
            >
              <p className="mb-4 font-display text-5xl font-medium tracking-tight text-white md:text-6xl lg:text-7xl">
                {stat.value}
              </p>
              <p className="max-w-[220px] text-sm leading-relaxed text-white/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
