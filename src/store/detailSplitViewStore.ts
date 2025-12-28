import { create } from 'zustand';

interface DetailSplitViewState {
  activeItemId: string | null;
  pinnedItemIds: string[];
  setActiveItemId: (itemId: string | null) => void;
  togglePinnedItem: (itemId: string) => void;
  unpinItem: (itemId: string) => void;
  clearPinnedItems: () => void;
}

export const useDetailSplitViewStore = create<DetailSplitViewState>((set) => ({
  activeItemId: null,
  pinnedItemIds: [],
  setActiveItemId: (itemId) => set({ activeItemId: itemId }),
  togglePinnedItem: (itemId) =>
    set((state) => {
      const isPinned = state.pinnedItemIds.includes(itemId);

      if (isPinned) {
        return {
          pinnedItemIds: state.pinnedItemIds.filter((id) => id !== itemId),
        };
      }

      return { pinnedItemIds: [...state.pinnedItemIds, itemId] };
    }),
  unpinItem: (itemId) =>
    set((state) => ({
      pinnedItemIds: state.pinnedItemIds.filter((id) => id !== itemId),
    })),
  clearPinnedItems: () => set({ pinnedItemIds: [] }),
}));
