import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { canvasFormats, canvasLabels } from '../data/landingContent';

type FormatId = (typeof canvasFormats)[number]['id'];

function TypingLine({ text, enabled }: { text: string; enabled: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [text, enabled]);

  if (!enabled) return <span>{text}</span>;

  return (
    <>
      <span>{text.slice(0, count)}</span>
      <span className="typing-caret" aria-hidden />
    </>
  );
}

export default function FormatCanvas({ assembled }: { assembled: boolean }) {
  const [formatId, setFormatId] = useState<FormatId>('4:5');
  const [labelIndex, setLabelIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const format =
    canvasFormats.find((f) => f.id === formatId) ?? canvasFormats[1];
  const line = canvasLabels
    .map((l) => `${l.key}: ${l.values[labelIndex]}`)
    .join('  ·  ');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!assembled || reduceMotion) return;
    const id = window.setInterval(() => {
      setLabelIndex((i) => (i + 1) % canvasLabels[0].values.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [assembled, reduceMotion]);

  return (
    <div
      className={`flex flex-col gap-4 ${assembled ? 'hero-enter' : 'opacity-0'}`}
      style={assembled ? { animationDelay: '0.35s' } : undefined}
    >
      <div className="flex flex-wrap gap-2">
        {canvasFormats.map((f) => (
          <Button
            key={f.id}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setFormatId(f.id)}
            className={cn(
              'rounded-md font-mono text-label-sm uppercase tracking-wider',
              formatId === f.id &&
                'border-primary bg-primary/10 text-primary hover:bg-primary/10',
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="relative flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-surface-container-low p-6 md:min-h-[420px]">
        <div
          className="crop-marks soft-card relative w-full max-w-md overflow-hidden transition-[aspect-ratio] duration-500 ease-spring"
          style={{ aspectRatio: format.aspect }}
        >
          <div className="absolute inset-0 bg-surface-container" />
          <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {format.spec}
          </div>
          <div className="absolute bottom-3 left-3 right-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
            <TypingLine
              key={line}
              text={line}
              enabled={assembled && !reduceMotion}
            />
          </div>
          <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-[1.5px] border-t-[1.5px] border-primary" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-[1.5px] border-l-[1.5px] border-primary" />
        </div>
      </div>
    </div>
  );
}
