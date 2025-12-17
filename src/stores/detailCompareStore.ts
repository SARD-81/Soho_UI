import { create } from 'zustand';

export type ViewMode = 'details' | 'compare';

interface DetailCompareState {
  activeId: string | null;
  pinnedIds: string[];
  viewMode: ViewMode;
  onlyDifferences: boolean;
  maxPinned: number;
  setActiveId: (id: string | null) => void;
  togglePin: (id: string) => void;
  removePin: (id: string) => void;
  clearPins: () => void;
  setPinned: (ids: string[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setOnlyDifferences: (value: boolean) => void;
}

export const useDetailCompareStore = create<DetailCompareState>((set) => ({
  activeId: null,
  pinnedIds: [],
  viewMode: 'details',
  onlyDifferences: false,
  maxPinned: 6,
  setActiveId: (id) => set({ activeId: id }),
  togglePin: (id) =>
    set((state) => {
      const exists = state.pinnedIds.includes(id);
      if (exists) {
        return { pinnedIds: state.pinnedIds.filter((item) => item !== id) };
      }

      if (state.pinnedIds.length >= state.maxPinned) {
        return state;
      }

      return { pinnedIds: [...state.pinnedIds, id] };
    }),
  removePin: (id) =>
    set((state) => ({ pinnedIds: state.pinnedIds.filter((item) => item !== id) })),
  clearPins: () => set({ pinnedIds: [] }),
  setPinned: (ids) => set({ pinnedIds: Array.from(new Set(ids)) }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setOnlyDifferences: (value) => set({ onlyDifferences: value }),
}));
