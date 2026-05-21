import { useCallback, useEffect, useState } from 'react';
import { ApiKeyPrompt } from '@/components/ApiKeyPrompt';
import { CurrentWeather } from '@/components/CurrentWeather';
import { EmptyState } from '@/components/EmptyState';
import { FavoritesList } from '@/components/FavoritesList';
import { ForecastList } from '@/components/ForecastList';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { SettingsPanel } from '@/components/SettingsPanel';
import { SunArc } from '@/components/SunArc';
import { TopBar } from '@/components/TopBar';
import { WeatherBackground } from '@/components/WeatherBackground';
import { reverseGeocode } from '@/api/openweather';
import { ApiError } from '@/api/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';
import { useApiKeyStore, useEffectiveApiKey } from '@/store/apiKey';
import { useCurrentCityStore } from '@/store/currentCity';
import { useFavoritesStore } from '@/store/favorites';
import { isNight, preferZhName } from '@/utils/format';
import { themeOf } from '@/utils/weatherTheme';

export default function App() {
  const apiKey = useEffectiveApiKey();
  const apiOverride = useApiKeyStore((s) => s.override);
  const envKey = import.meta.env.VITE_OWM_API_KEY ?? '';

  const city = useCurrentCityStore((s) => s.city);
  const setCity = useCurrentCityStore((s) => s.setCity);
  const favorites = useFavoritesStore((s) => s.items);

  const geo = useGeolocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [initTried, setInitTried] = useState(false);

  /* Initial-load policy:
   *   1. If we already have a saved favorite, jump straight to it — no geo prompt needed.
   *   2. Otherwise request browser geolocation (fires the permission dialog once).
   *   3. If geo is denied / unsupported / fails, EmptyState handles the messaging.
   */
  useEffect(() => {
    if (initTried || city) return;
    setInitTried(true);
    if (favorites.length > 0) {
      setCity(favorites[0]);
    } else {
      geo.request();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When geolocation resolves to coords, reverse-geocode them into a FavoriteCity.
  useEffect(() => {
    if (geo.status !== 'success' || !geo.coords) return;
    if (city) return; // user already picked one
    if (!apiKey) return;
    let cancelled = false;
    reverseGeocode(geo.coords.lat, geo.coords.lon, { apiKey })
      .then((g) => {
        if (cancelled || !g) return;
        setCity({
          id: `${g.lat},${g.lon}`,
          name: preferZhName(g.name, g.local_names),
          country: g.country,
          state: g.state,
          lat: g.lat,
          lon: g.lon,
          addedAt: Date.now(),
        });
      })
      .catch(() => {
        // Silent — EmptyState will keep showing if no city resolves.
      });
    return () => {
      cancelled = true;
    };
  }, [geo.status, geo.coords, apiKey, city, setCity]);

  const { loading, current, daily, error } = useWeather(
    city?.lat ?? null,
    city?.lon ?? null,
  );

  // Theme derivation — defaults to clear-day when we have nothing to draw with.
  const theme = current
    ? themeOf(
        current.weather[0].id,
        isNight(current.dt, current.sys.sunrise, current.sys.sunset),
      )
    : 'clear-day';

  const onOpenSettings = useCallback(() => setSettingsOpen(true), []);
  const onCloseSettings = useCallback(() => setSettingsOpen(false), []);

  const keyMissing = !apiKey;
  const keyInvalid = error?.code === 'INVALID_KEY';
  const showApiKeyPrompt = keyMissing || keyInvalid;

  return (
    <WeatherBackground theme={theme}>
      <TopBar theme={theme} onOpenSettings={onOpenSettings} />

      {showApiKeyPrompt && (
        <ApiKeyPrompt
          message={
            keyMissing
              ? 'API key 缺失,无法查询天气。'
              : `API key 无效${apiOverride ? '(用户覆盖)' : envKey ? '(构建默认)' : ''}。`
          }
          onOpenSettings={onOpenSettings}
        />
      )}

      {!city && !showApiKeyPrompt && (
        <EmptyState theme={theme} geoStatus={geo.status} onRequestLocation={geo.request} />
      )}

      {city && loading && !current && <LoadingSkeleton theme={theme} />}

      {city && error && !showApiKeyPrompt && (
        <ErrorBanner err={error} />
      )}

      {city && current && (
        <>
          <CurrentWeather data={current} displayName={city.name} theme={theme} />
          {daily.length > 0 && <ForecastList days={daily} theme={theme} />}

          <section className="px-6 md:px-10 mt-10 md:mt-12 max-w-[1280px] mx-auto pb-12">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-end">
              <SunArc
                sunrise={current.sys.sunrise}
                sunset={current.sys.sunset}
                now={current.dt}
                tzOffsetSec={current.timezone}
                theme={theme}
              />
              <FavoritesList theme={theme} />
            </div>
          </section>
        </>
      )}

      <SettingsPanel open={settingsOpen} onClose={onCloseSettings} />
    </WeatherBackground>
  );
}

function ErrorBanner({ err }: { err: ApiError }) {
  return (
    <div className="relative z-20 mx-6 md:mx-10 mt-6 rounded-lg bg-red-900/30 ring-1 ring-red-300/30 text-red-50 px-4 py-3 text-[13px]">
      {err.message}
    </div>
  );
}
