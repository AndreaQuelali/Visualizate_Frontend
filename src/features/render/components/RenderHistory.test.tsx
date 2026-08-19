import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RenderHistory, { formatBytes, jobLabel } from './RenderHistory';
import type { RenderJob } from '../api/render.api';

const state = vi.hoisted(() => ({
  jobs: [] as unknown[],
  cancel: vi.fn(),
  retry: vi.fn(),
  download: vi.fn(),
}));

vi.mock('../hooks/useRender', () => ({
  useRenderJobs: () => ({
    data: state.jobs,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCancelRender: () => ({ mutateAsync: state.cancel, isPending: false }),
  useRequestRender: () => ({ mutateAsync: state.retry, isPending: false }),
  downloadRender: state.download,
}));

const job = (extra: Partial<RenderJob>): RenderJob => ({
  id: 'j1',
  pieceId: 'p1',
  format: 'PNG',
  scale: 2,
  status: 'SUCCEEDED',
  attempts: 1,
  errorCode: null,
  errorMessage: null,
  outputBytes: 2048,
  durationMs: 900,
  createdAt: new Date('2026-08-15T10:00:00Z').toISOString(),
  finishedAt: null,
  downloadable: true,
  ...extra,
});

const view = (canRetry = true) =>
  render(<RenderHistory workspaceId="w1" pieceId="p1" canRetry={canRetry} />);

describe('RenderHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.cancel.mockResolvedValue({});
    state.retry.mockResolvedValue({});
    state.download.mockResolvedValue(undefined);
  });

  it('shows an empty state', () => {
    state.jobs = [];
    view();
    expect(
      screen.getByText('Aún no exportaste esta pieza.'),
    ).toBeInTheDocument();
  });

  it('lists a finished job and downloads it', async () => {
    state.jobs = [job({})];
    view();
    expect(screen.getByText('PNG 2×')).toBeInTheDocument();
    expect(screen.getByText('Listo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /descargar/i }));
    expect(state.download).toHaveBeenCalledWith('w1', 'j1');
  });

  it('lets the user cancel an active job', async () => {
    state.jobs = [
      job({ status: 'RUNNING', downloadable: false, outputBytes: null }),
    ];
    view();
    expect(screen.getByText('Procesando')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(state.cancel).toHaveBeenCalledWith('j1');
  });

  it('shows the failure and retries with the same format and scale', async () => {
    state.jobs = [
      job({
        status: 'FAILED',
        downloadable: false,
        outputBytes: null,
        errorMessage: 'No se pudo cargar una imagen',
      }),
    ];
    view();
    expect(
      screen.getByText('No se pudo cargar una imagen'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(state.retry).toHaveBeenCalledWith({ format: 'PNG', scale: 2 });
  });

  it('disables retry when the piece cannot be exported', () => {
    state.jobs = [job({ status: 'FAILED', downloadable: false })];
    view(false);
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeDisabled();
  });
});

describe('helpers', () => {
  it('formats sizes and labels', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
    expect(jobLabel({ format: 'PDF', scale: 1 })).toBe('PDF');
    expect(jobLabel({ format: 'PNG', scale: 3 })).toBe('PNG 3×');
  });
});
