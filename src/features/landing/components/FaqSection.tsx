import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { faqs } from '../data/landingContent';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-surface-container-lowest py-section-gap md:py-section-gap-lg">
      <div className="mx-auto max-w-3xl px-gutter">
        <h2 className="mb-12 text-center text-headline-lg text-foreground">
          Preguntas frecuentes
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="border-b border-outline-variant pb-2"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <h4 className="text-lg font-bold text-foreground">
                    {faq.question}
                  </h4>
                  {isOpen ? (
                    <Minus className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <Plus className="h-5 w-5 shrink-0 text-primary" />
                  )}
                </button>
                {isOpen && (
                  <p className="pb-6 text-body-md text-muted-foreground">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
