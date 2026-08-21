import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { isBlockError, type Block } from '../api/dashboard.api';

interface BlockFrameProps<T> {
  title: string;
  description?: string;
  block: Block<T> | undefined;
  isLoading: boolean;
  /** Message shown when the block loaded but has nothing to list. */
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  onRetry: () => void;
  className?: string;
  children: (data: T) => ReactNode;
}

/**
 * One dashboard block with its own loading, empty and error states, so a
 * failing block never breaks the rest of the page.
 */
export default function BlockFrame<T>({
  title,
  description,
  block,
  isLoading,
  emptyMessage,
  isEmpty,
  onRetry,
  className,
  children,
}: BlockFrameProps<T>) {
  let body: ReactNode;
  if (isLoading || block === undefined) {
    body = (
      <div className="space-y-2" role="status" aria-label={`Cargando ${title}`}>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
      </div>
    );
  } else if (isBlockError(block)) {
    body = (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-r-lg border-l-4 border-destructive bg-destructive/10 p-3 text-sm text-destructive"
      >
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div className="flex-1">
          <p>{block.error}</p>
          <Button
            variant="ghost"
            size="xs"
            className="mt-1 -ml-2 text-destructive"
            onClick={onRetry}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  } else if (isEmpty(block)) {
    body = <p className="py-4 text-sm text-muted-foreground">{emptyMessage}</p>;
  } else {
    body = children(block);
  }

  return (
    <section
      aria-label={title}
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-sm',
        className,
      )}
    >
      <header className="mb-3">
        <h2 className="font-medium">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      {body}
    </section>
  );
}
