import { useState } from 'react';
import { ChevronDown, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getErrorMessage, getRetryAfterSeconds } from '@/lib/errors';
import type { RequestRenderPayload } from '../api/render.api';
import { useRequestRender } from '../hooks/useRender';

export const EXPORT_OPTIONS: Array<{
  label: string;
  payload: RequestRenderPayload;
}> = [
  { label: 'PNG (1×)', payload: { format: 'PNG', scale: 1 } },
  { label: 'PNG (2×, alta resolución)', payload: { format: 'PNG', scale: 2 } },
  { label: 'PNG (3×)', payload: { format: 'PNG', scale: 3 } },
  { label: 'PDF', payload: { format: 'PDF' } },
];

interface ExportMenuProps {
  workspaceId: string;
  pieceId: string;
  /** Why exporting is not possible right now (shown to the user). */
  blockedReason: string | null;
}

export default function ExportMenu({
  workspaceId,
  pieceId,
  blockedReason,
}: ExportMenuProps) {
  const request = useRequestRender(workspaceId, pieceId);
  const [message, setMessage] = useState<string | null>(null);

  const start = async (payload: RequestRenderPayload) => {
    setMessage(null);
    try {
      const { reused } = await request.mutateAsync(payload);
      if (reused) {
        setMessage('Ya existe una exportación idéntica; la reutilizamos.');
      }
    } catch (err: unknown) {
      const wait = getRetryAfterSeconds(err);
      const base = getErrorMessage(err, 'No se pudo iniciar la exportación');
      setMessage(wait ? `${base}. Reintenta en ${wait} s.` : base);
    }
  };

  return (
    <div className="space-y-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!blockedReason || request.isPending}
            />
          }
        >
          {request.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Exportar
          <ChevronDown className="size-3.5 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Formato</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {EXPORT_OPTIONS.map((o) => (
            <DropdownMenuItem
              key={o.label}
              onClick={() => void start(o.payload)}
            >
              {o.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {blockedReason && (
        <p className="text-xs text-muted-foreground">{blockedReason}</p>
      )}
      {message && (
        <p role="status" className="text-xs text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
}
