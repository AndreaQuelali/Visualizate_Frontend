import type { DashboardUsage, Meter } from '../api/dashboard.api';
import { formatBytes, usagePercent } from '../format';
import { cn } from '@/lib/utils';

function MeterRow({
  label,
  meter,
  format = String,
}: {
  label: string;
  meter: Meter;
  format?: (n: number) => string;
}) {
  const pct = usagePercent(meter.used, meter.limit);
  const tone =
    pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary';
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">
          {format(meter.used)} de {format(meter.limit)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct} % usado`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn('h-full rounded-full transition-all', tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct >= 100 && (
        <p className="mt-1 text-xs text-destructive">
          Alcanzaste el límite: no podrás crear más hasta liberar espacio o
          esperar al próximo periodo.
        </p>
      )}
    </div>
  );
}

export default function UsageCard({ usage }: { usage: DashboardUsage }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Este periodo creaste{' '}
        <strong className="text-foreground">
          {usage.piecesCreatedThisMonth}
        </strong>{' '}
        {usage.piecesCreatedThisMonth === 1 ? 'pieza' : 'piezas'}.
      </p>
      <MeterRow label="Piezas activas" meter={usage.activePieces} />
      <MeterRow label="Exportaciones del mes" meter={usage.rendersPerMonth} />
      <MeterRow
        label="Revisiones con IA del mes"
        meter={usage.reviewsPerMonth}
      />
      <MeterRow
        label="Almacenamiento de assets"
        meter={usage.storageBytes}
        format={formatBytes}
      />
    </div>
  );
}
