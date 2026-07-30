import { showcaseColumns } from '../data/landingContent';

export default function ProductShowcase() {
  return (
    <section className="overflow-hidden bg-background py-section-gap md:py-section-gap-lg">
      <div className="mx-auto max-w-container-max px-gutter">
        <h2 className="mb-12 text-center text-headline-lg text-foreground md:mb-16">
          Resultados de nivel profesional
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {showcaseColumns.map((column, colIdx) => (
            <div
              key={colIdx}
              className={`space-y-4 md:space-y-6 ${column.offsetClass}`}
            >
              {column.items.map((item) => (
                <div
                  key={item.src}
                  className="soft-card group overflow-hidden rounded-2xl"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className={`${item.aspect} w-full object-cover transition-transform duration-500 group-hover:scale-105`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
