import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { faqs } from '../data/landingContent';
import { useReveal } from '../hooks/useReveal';

export default function FaqSection() {
  const [ref, visible] = useReveal<HTMLElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      ref={ref}
      className="bg-surface-container-lowest py-section-gap md:py-section-gap-lg"
    >
      <div className="mx-auto max-w-3xl px-gutter">
        <div
          className={`mb-12 text-center ${
            visible ? 'reveal is-visible' : 'reveal'
          }`}
        >
          <p className="mb-3 font-mono text-label-sm uppercase tracking-widest text-primary">
            faq
          </p>
          <h2 className="font-display text-headline-lg text-foreground">
            Preguntas frecuentes
          </h2>
        </div>
        <div className="space-y-0 border-t border-border">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="border-b border-border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                <div className={`faq-panel ${isOpen ? 'is-open' : ''}`}>
                  <div>
                    <p className="pb-5 text-body-md text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
