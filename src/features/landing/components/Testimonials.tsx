import { testimonials } from '../data/landingContent';

export default function Testimonials() {
  return (
    <section className="bg-surface-container-lowest py-section-gap md:py-section-gap-lg">
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="soft-card flex flex-col justify-between rounded-2xl p-8"
            >
              <p className="mb-8 text-body-md italic text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4 border-t border-outline-variant pt-6">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover"
                />
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
