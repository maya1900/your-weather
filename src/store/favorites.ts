import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FavoriteCity } from '@/api/types';

interface FavoritesStore {
  items: FavoriteCity[];
  add: (city: FavoriteCity) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const MAX_FAVORITES = 20;

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (city) =>
        set((state) => {
          if (state.items.some((c) => c.id === city.id)) return state;
          if (state.items.length >= MAX_FAVORITES) return state;
          return { items: [...state.items, city] };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((c) => c.id !== id) })),
      has: (id) => get().items.some((c) => c.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'your-weather:favorites' },
  ),
);
