import { logos } from '../data/landingContent';

export default function SocialProof() {
  return (
    <section className="border-y border-outline-variant bg-surface-container-lowest py-16 md:py-20">
      <div className="mx-auto max-w-container-max px-gutter text-center">
        <p className="mb-10 text-label-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Utilizado por comunidades, empresas y equipos creativos
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 dark:opacity-40 md:gap-20">
          {logos.map((logo) => (
            <img
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              className="h-6 md:h-8"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
