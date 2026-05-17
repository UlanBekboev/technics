import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  ids: number[];
  setIds: (ids: number[]) => void;
  toggle: (id: number) => void;
  has: (id: number) => boolean;
  count: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: [],
      setIds: (ids) => set({ ids }),
      toggle: (id) => {
        const ids = get().ids;
        set({ ids: ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id] });
      },
      has: (id) => get().ids.includes(id),
      count: () => get().ids.length,
    }),
    { name: 'favorites' },
  ),
);
