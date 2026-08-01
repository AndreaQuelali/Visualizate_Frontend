export default function SocialProof() {
  return (
    <section className="border-y border-outline-variant bg-surface-container-lowest py-16 md:py-20">
      <div className="mx-auto max-w-container-max px-gutter text-center">
        <p className="mb-10 text-label-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Utilizado por comunidades, empresas y equipos creativos
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-20">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-24 rounded-lg bg-surface-container md:h-10 md:w-28"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
