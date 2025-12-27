import { create } from 'zustand';

interface DetailSelectionState {
  activeItemId: string | null;
  pinnedItemIds: string[];
  setActiveItemId: (itemId: string | null) => void;
  pinItem: (itemId: string) => void;
  unpinItem: (itemId: string) => void;
  togglePin: (itemId: string) => void;
  clearPinned: () => void;
}

const uniqueAppend = (items: string[], item: string) => {
  if (items.includes(item)) return items;
  return [...items, item];
};

export const useDetailSelectionStore = create<DetailSelectionState>((set) => ({
  activeItemId: null,
  pinnedItemIds: [],
  setActiveItemId: (itemId) =>
    set({
      activeItemId: itemId,
    }),
  pinItem: (itemId) =>
    set((state) => ({
      pinnedItemIds: uniqueAppend(state.pinnedItemIds, itemId),
    })),
  unpinItem: (itemId) =>
    set((state) => ({
      pinnedItemIds: state.pinnedItemIds.filter((id) => id !== itemId),
    })),
  togglePin: (itemId) =>
    set((state) => {
      const isPinned = state.pinnedItemIds.includes(itemId);

      return {
        pinnedItemIds: isPinned
          ? state.pinnedItemIds.filter((id) => id !== itemId)
          : uniqueAppend(state.pinnedItemIds, itemId),
      };
    }),
  clearPinned: () => set({ pinnedItemIds: [] }),
}));

export const selectActiveItemId = (state: DetailSelectionState) => state.activeItemId;
export const selectPinnedItemIds = (state: DetailSelectionState) => state.pinnedItemIds;
export const selectIsPinned = (itemId: string) => (state: DetailSelectionState) =>
  state.pinnedItemIds.includes(itemId);
export const selectSetActiveItemId = (state: DetailSelectionState) => state.setActiveItemId;
export const selectTogglePin = (state: DetailSelectionState) => state.togglePin;
