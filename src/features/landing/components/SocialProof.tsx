import { useReveal } from '../hooks/useReveal';

export default function SocialProof() {
  const [ref, visible] = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`border-y border-border bg-surface-container-lowest py-14 md:py-16 ${
        visible ? 'reveal is-visible' : 'reveal'
      }`}
    >
      <div className="mx-auto max-w-container-max px-gutter text-center">
        <p className="mb-8 font-mono text-label-sm uppercase tracking-widest text-muted-foreground">
          utilizado por comunidades · empresas · equipos creativos
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-24 rounded-md border border-border bg-surface-container md:h-9 md:w-28"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
