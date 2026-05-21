import { useEffect, useState } from 'react';
import { searchCities } from '@/api/openweather';
import type { GeoCity } from '@/api/types';
import { ApiError } from '@/api/types';
import { useEffectiveApiKey } from '@/store/apiKey';
import { useDebounce } from './useDebounce';

interface SearchState {
  loading: boolean;
  results: GeoCity[];
  error: ApiError | null;
}

export function useCitySearch(query: string) {
  const apiKey = useEffectiveApiKey();
  const debounced = useDebounce(query, 300);
  const [state, setState] = useState<SearchState>({ loading: false, results: [], error: null });

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 1) {
      setState({ loading: false, results: [], error: null });
      return;
    }
    let cancelled = false;
    setState({ loading: true, results: [], error: null });
    searchCities(q, { apiKey })
      .then((results) => !cancelled && setState({ loading: false, results, error: null }))
      .catch((err: unknown) => {
        if (cancelled) return;
        const apiErr =
          err instanceof ApiError ? err : new ApiError('UNKNOWN', (err as Error).message);
        setState({ loading: false, results: [], error: apiErr });
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, apiKey]);

  return state;
}
