import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiKeyStore {
  override: string;
  setOverride: (key: string) => void;
  clearOverride: () => void;
}

const useApiKeyStoreInternal = create<ApiKeyStore>()(
  persist(
    (set) => ({
      override: '',
      setOverride: (override) => set({ override: override.trim() }),
      clearOverride: () => set({ override: '' }),
    }),
    { name: 'your-weather:apikey-override' },
  ),
);

export const useApiKeyStore = useApiKeyStoreInternal;

/**
 * Resolve the effective API key: user override wins over build-time env var.
 * Call outside React (e.g. in API helpers) by reading the store's state.
 */
export function getEffectiveApiKey(): string {
  const override = useApiKeyStoreInternal.getState().override;
  if (override) return override;
  return import.meta.env.VITE_OWM_API_KEY ?? '';
}

/**
 * Hook variant for use inside React components — re-renders when override changes.
 */
export function useEffectiveApiKey(): string {
  const override = useApiKeyStoreInternal((s) => s.override);
  return override || import.meta.env.VITE_OWM_API_KEY || '';
}
