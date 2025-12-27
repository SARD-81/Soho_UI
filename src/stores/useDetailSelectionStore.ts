import { create } from 'zustand';
import type { DetailComparisonStatus } from '../components/common/DetailComparisonPanel';

export interface DetailSelectionItem {
  id: string;
  title: string;
  values: Record<string, unknown>;
  status?: DetailComparisonStatus;
}

interface DetailSelectionState {
  activeItemId: string | null;
  pinnedItemIds: string[];
  items: Record<string, DetailSelectionItem>;
  setActiveItemId: (id: string | null) => void;
  registerItem: (item: DetailSelectionItem) => void;
  getItemsByIds: (ids: string[]) => DetailSelectionItem[];
  togglePin: (id: string) => void;
  unpin: (id: string) => void;
  clearPins: () => void;
  isPinned: (id: string) => boolean;
}

const useDetailSelectionStore = create<DetailSelectionState>((set, get) => ({
  activeItemId: null,
  pinnedItemIds: [],
  items: {},
  setActiveItemId: (id) => set({ activeItemId: id }),
  registerItem: (item) =>
    set((state) => ({
      items: {
        ...state.items,
        [item.id]: item,
      },
    })),
  getItemsByIds: (ids) => ids.map((id) => get().items[id]).filter(Boolean),
  togglePin: (id) =>
    set((state) => {
      const pinnedSet = new Set(state.pinnedItemIds);

      if (pinnedSet.has(id)) {
        pinnedSet.delete(id);
      } else {
        pinnedSet.add(id);
      }

      return { pinnedItemIds: Array.from(pinnedSet) };
    }),
  unpin: (id) =>
    set((state) => ({ pinnedItemIds: state.pinnedItemIds.filter((pinned) => pinned !== id) })),
  clearPins: () => set({ pinnedItemIds: [] }),
  isPinned: (id) => get().pinnedItemIds.includes(id),
}));

export default useDetailSelectionStore;
