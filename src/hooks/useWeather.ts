import { useEffect, useState } from 'react';
import { getCurrentWeather, getForecast, aggregateDaily } from '@/api/openweather';
import type { CurrentWeather, DailyForecast, ForecastResponse } from '@/api/types';
import { ApiError } from '@/api/types';
import { useEffectiveApiKey } from '@/store/apiKey';

interface WeatherState {
  loading: boolean;
  current: CurrentWeather | null;
  forecast: ForecastResponse | null;
  daily: DailyForecast[];
  error: ApiError | null;
}

const INITIAL: WeatherState = {
  loading: false,
  current: null,
  forecast: null,
  daily: [],
  error: null,
};

/**
 * Fetches current weather + forecast in parallel whenever lat/lon (or API key) changes.
 * The two endpoints are concurrent — saves ~one round-trip.
 */
export function useWeather(lat: number | null, lon: number | null): WeatherState & { refetch: () => void } {
  const apiKey = useEffectiveApiKey();
  const [state, setState] = useState<WeatherState>(INITIAL);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (lat === null || lon === null) {
      setState(INITIAL);
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all([
      getCurrentWeather(lat, lon, { apiKey }),
      getForecast(lat, lon, { apiKey }),
    ])
      .then(([current, forecast]) => {
        if (cancelled) return;
        setState({
          loading: false,
          current,
          forecast,
          daily: aggregateDaily(forecast),
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const apiErr =
          err instanceof ApiError ? err : new ApiError('UNKNOWN', (err as Error).message);
        setState({ loading: false, current: null, forecast: null, daily: [], error: apiErr });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon, apiKey, nonce]);

  return { ...state, refetch: () => setNonce((n) => n + 1) };
}
