export default function ProductShowcase() {
  return (
    <section className="overflow-hidden bg-background py-section-gap md:py-section-gap-lg">
      <div className="mx-auto max-w-container-max px-gutter">
        <h2 className="mb-12 text-center text-headline-lg text-foreground md:mb-16">
          Resultados de nivel profesional
        </h2>

        <div className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[160px] sm:gap-4 md:auto-rows-[180px] md:grid-cols-4 md:gap-5 lg:auto-rows-[200px]">
          {/* Celda grande — hero visual */}
          <div className="soft-card col-span-2 row-span-2 overflow-hidden rounded-2xl bg-surface-container md:col-span-2 md:row-span-2" />

          {/* Celda alta */}
          <div className="soft-card row-span-2 overflow-hidden rounded-2xl bg-surface-container-low" />

          {/* Celda media */}
          <div className="soft-card overflow-hidden rounded-2xl bg-surface-variant" />

          {/* Celda media */}
          <div className="soft-card overflow-hidden rounded-2xl bg-surface-container" />

          {/* Fila ancha */}
          <div className="soft-card col-span-2 overflow-hidden rounded-2xl bg-surface-container-low md:col-span-2" />

          {/* Celda media */}
          <div className="soft-card overflow-hidden rounded-2xl bg-surface-variant" />

          {/* Celda ancha inferior */}
          <div className="soft-card col-span-2 overflow-hidden rounded-2xl bg-surface-container md:col-span-3" />
        </div>
      </div>
    </section>
  );
}
