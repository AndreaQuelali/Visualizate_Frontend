import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewPanel, { aiNotice } from './ReviewPanel';
import type { Review, ReviewItem } from '../api/review.api';

const state = vi.hoisted(() => ({
  list: [] as Array<{ id: string }>,
  review: undefined as unknown,
  settings: { aiEnabled: true, aiAvailable: true },
  apply: vi.fn(),
  dismiss: vi.fn(),
  revert: vi.fn(),
  applyMany: vi.fn(),
  request: vi.fn(),
  setAi: vi.fn(),
}));

vi.mock('../hooks/useReview', () => ({
  useReviews: () => ({ data: state.list, isLoading: false }),
  useReview: () => ({ data: state.review, isError: false }),
  useRequestReview: () => ({ mutateAsync: state.request, isPending: false }),
  useReviewActions: () => ({
    apply: { mutateAsync: state.apply, isPending: false },
    dismiss: { mutateAsync: state.dismiss, isPending: false },
    revert: { mutateAsync: state.revert, isPending: false },
    applyMany: { mutateAsync: state.applyMany, isPending: false },
  }),
  useReviewSettings: () => ({ data: state.settings }),
  useUpdateReviewSettings: () => ({ mutate: state.setAi, isPending: false }),
}));

const item = (over: Partial<ReviewItem> = {}): ReviewItem => ({
  id: 'i1',
  reviewId: 'r1',
  category: 'LEGIBILITY',
  severity: 'CRITICAL',
  source: 'RULE',
  title: 'Poco contraste en «Título»',
  explanation: 'El contraste es 1.8:1.',
  target: { layerId: 'l1' },
  patch: {
    kind: 'layer_prop',
    layerId: 'l1',
    prop: 'color',
    from: { hex: '#bbbbbb' },
    to: { hex: '#111111' },
  },
  status: 'PENDING',
  decidedAt: null,
  ...over,
});

const review = (over: Partial<Review> = {}): Review => ({
  id: 'r1',
  pieceId: 'p1',
  status: 'COMPLETED',
  aiStatus: 'OK',
  summary: 'Hay un problema de contraste.',
  model: 'gpt-4o',
  errorMessage: null,
  createdAt: new Date().toISOString(),
  finishedAt: null,
  items: [item()],
  ...over,
});

const view = (
  props: Partial<React.ComponentProps<typeof ReviewPanel>> = {},
) => {
  const onPreview = vi.fn();
  const onPieceChanged = vi.fn();
  render(
    <ReviewPanel
      workspaceId="w1"
      pieceId="p1"
      isAdmin={false}
      dirty={false}
      archived={false}
      onPreview={onPreview}
      onPieceChanged={onPieceChanged}
      {...props}
    />,
  );
  return { onPreview, onPieceChanged };
};

describe('ReviewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.list = [{ id: 'r1' }];
    state.review = review();
    state.settings = { aiEnabled: true, aiAvailable: true };
    state.apply.mockResolvedValue({});
    state.dismiss.mockResolvedValue({});
    state.revert.mockResolvedValue({});
    state.request.mockResolvedValue({});
    state.applyMany.mockResolvedValue({ applied: ['i1'], failed: [] });
  });

  it('invites to review when there is no review yet', () => {
    state.list = [];
    state.review = undefined;
    view();
    expect(
      screen.getByText('Aún no revisaste esta pieza.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^revisar$/i })).toBeEnabled();
  });

  it('shows progress while the review is running', () => {
    state.review = review({ status: 'RUNNING', items: [] });
    view();
    expect(screen.getByText(/analizando composición/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revisando/i })).toBeDisabled();
  });

  it('shows "Todo en orden" when nothing was found', () => {
    state.review = review({ items: [], summary: 'Todo bien.' });
    view();
    expect(screen.getByText('Todo en orden')).toBeInTheDocument();
  });

  it('lists a recommendation with its source, change and previews it on hover', async () => {
    const { onPreview } = view();
    expect(screen.getByText('Poco contraste en «Título»')).toBeInTheDocument();
    expect(screen.getByText('Regla')).toBeInTheDocument();
    expect(screen.getByText('Color: #bbbbbb → #111111')).toBeInTheDocument();
    await userEvent.hover(screen.getByText('Poco contraste en «Título»'));
    expect(onPreview).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'i1' }),
    );
  });

  it('applies on an explicit click and tells the editor to reload', async () => {
    const { onPieceChanged } = view();
    await userEvent.click(screen.getByRole('button', { name: /^aplicar$/i }));
    expect(state.apply).toHaveBeenCalledWith('i1');
    expect(onPieceChanged).toHaveBeenCalled();
  });

  it('never applies anything without a click', () => {
    view();
    expect(state.apply).not.toHaveBeenCalled();
    expect(state.applyMany).not.toHaveBeenCalled();
  });

  it('dismisses without touching the piece', async () => {
    const { onPieceChanged } = view();
    await userEvent.click(screen.getByRole('button', { name: /descartar/i }));
    expect(state.dismiss).toHaveBeenCalledWith('i1');
    expect(onPieceChanged).not.toHaveBeenCalled();
  });

  it('offers undo for an applied item and reverts it', async () => {
    state.review = review({ items: [item({ status: 'APPLIED' })] });
    const { onPieceChanged } = view();
    expect(screen.getByText('Aplicada')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /deshacer/i }));
    expect(state.revert).toHaveBeenCalledWith('i1');
    expect(onPieceChanged).toHaveBeenCalled();
  });

  it('advice without a patch cannot be applied', () => {
    state.review = review({ items: [item({ patch: null, source: 'AI' })] });
    view();
    expect(screen.queryByRole('button', { name: /^aplicar$/i })).toBeNull();
    expect(screen.getByText(/es un consejo/i)).toBeInTheDocument();
    expect(screen.getByText('IA')).toBeInTheDocument();
  });

  it('marks stale items as outdated', () => {
    state.review = review({ items: [item({ status: 'STALE' })] });
    view();
    expect(screen.getByText('Obsoleta')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^aplicar$/i })).toBeNull();
  });

  it('applies the selected ones only after confirming', async () => {
    view();
    await userEvent.click(
      screen.getByRole('checkbox', { name: /seleccionar: poco contraste/i }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /aplicar seleccionadas \(1\)/i }),
    );
    expect(state.applyMany).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /^aplicar$/i }));
    expect(state.applyMany).toHaveBeenCalledWith({
      reviewId: 'r1',
      itemIds: ['i1'],
    });
  });

  it('blocks reviewing and applying while there are unsaved changes', () => {
    view({ dirty: true });
    expect(
      screen.getByRole('button', { name: /revisar de nuevo/i }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: /^aplicar$/i })).toBeDisabled();
    expect(screen.getByText(/guarda tus cambios/i)).toBeInTheDocument();
  });

  it('explains when the AI was not used', () => {
    state.review = review({ aiStatus: 'SKIPPED_NO_KEY' });
    view();
    expect(screen.getByText(/no está configurada/i)).toBeInTheDocument();
  });

  it('lets only admins turn the AI off for the workspace', async () => {
    view({ isAdmin: true });
    await userEvent.click(
      screen.getByRole('checkbox', { name: /usar ia en las revisiones/i }),
    );
    expect(state.setAi).toHaveBeenCalledWith(false);
  });

  it('hides the AI setting for non admins', () => {
    view({ isAdmin: false });
    expect(
      screen.queryByRole('checkbox', { name: /usar ia en las revisiones/i }),
    ).toBeNull();
  });
});

describe('aiNotice', () => {
  it('returns a message only when the AI did not contribute', () => {
    expect(aiNotice('OK', null)).toBeNull();
    expect(aiNotice('DISABLED', null)).toMatch(/desactivada/);
    expect(aiNotice('FAILED', 'La IA está saturada')).toMatch(/saturada/);
  });
});
