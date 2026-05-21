import { create } from 'zustand';
import type { FavoriteCity } from '@/api/types';

interface CurrentCityStore {
  city: FavoriteCity | null;
  setCity: (city: FavoriteCity) => void;
  clear: () => void;
}

export const useCurrentCityStore = create<CurrentCityStore>((set) => ({
  city: null,
  setCity: (city) => set({ city }),
  clear: () => set({ city: null }),
}));
