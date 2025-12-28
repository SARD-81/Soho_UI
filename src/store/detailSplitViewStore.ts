import { create } from 'zustand';

export interface DetailSplitViewState {
  views: Record<string, { activeItemId: string | null; pinnedItemIds: string[] }>;
  setActiveItemId: (viewId: string, itemId: string | null) => void;
  togglePinnedItem: (viewId: string, itemId: string) => void;
  unpinItem: (viewId: string, itemId: string) => void;
  clearPinnedItems: (viewId: string) => void;
}

export const DEFAULT_DETAIL_VIEW_ID = 'default';

const DEFAULT_VIEW_STATE = { activeItemId: null, pinnedItemIds: [] } as const;

const ensureView = (
  views: DetailSplitViewState['views'],
  viewId: string
): { activeItemId: string | null; pinnedItemIds: string[] } =>
  views[viewId] ?? DEFAULT_VIEW_STATE;

const upsertView = (
  views: DetailSplitViewState['views'],
  viewId: string,
  partial: Partial<{ activeItemId: string | null; pinnedItemIds: string[] }>
) => {
  const nextView = { ...ensureView(views, viewId), ...partial };

  return {
    ...views,
    [viewId]: nextView,
  } satisfies DetailSplitViewState['views'];
};

export const selectDetailViewState = (viewId: string = DEFAULT_DETAIL_VIEW_ID) =>
  (state: DetailSplitViewState) => ensureView(state.views, viewId);

export const useDetailSplitViewStore = create<DetailSplitViewState>((set) => ({
  views: {},
  setActiveItemId: (viewId, itemId) =>
    set((state) => {
      const existing = ensureView(state.views, viewId);

      if (existing.activeItemId === itemId) {
        return state;
      }

      return { views: upsertView(state.views, viewId, { activeItemId: itemId }) };
    }),
  togglePinnedItem: (viewId, itemId) =>
    set((state) => {
      const { pinnedItemIds } = ensureView(state.views, viewId);
      const isPinned = pinnedItemIds.includes(itemId);
      const nextPinned = isPinned
        ? pinnedItemIds.filter((id) => id !== itemId)
        : [...pinnedItemIds, itemId];

      return { views: upsertView(state.views, viewId, { pinnedItemIds: nextPinned }) };
    }),
  unpinItem: (viewId, itemId) =>
    set((state) => ({
      views: upsertView(state.views, viewId, {
        pinnedItemIds: ensureView(state.views, viewId).pinnedItemIds.filter(
          (id) => id !== itemId
        ),
      }),
    })),
  clearPinnedItems: (viewId) =>
    set((state) => ({ views: upsertView(state.views, viewId, { pinnedItemIds: [] }) })),
}));
