import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TempUnit = 'C' | 'F';
export type WindUnit = 'm/s' | 'km/h';

interface UnitsStore {
  temp: TempUnit;
  wind: WindUnit;
  setTemp: (u: TempUnit) => void;
  setWind: (u: WindUnit) => void;
  toggleTemp: () => void;
  toggleWind: () => void;
}

export const useUnitsStore = create<UnitsStore>()(
  persist(
    (set) => ({
      temp: 'C',
      wind: 'm/s',
      setTemp: (temp) => set({ temp }),
      setWind: (wind) => set({ wind }),
      toggleTemp: () => set((s) => ({ temp: s.temp === 'C' ? 'F' : 'C' })),
      toggleWind: () => set((s) => ({ wind: s.wind === 'm/s' ? 'km/h' : 'm/s' })),
    }),
    { name: 'your-weather:units' },
  ),
);
