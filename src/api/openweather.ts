import { owmFetch } from './client';
import type {
  CurrentWeather,
  DailyForecast,
  ForecastItem,
  ForecastResponse,
  GeoCity,
} from './types';

export interface ApiOptions {
  apiKey: string;
}

export function searchCities(q: string, opts: ApiOptions): Promise<GeoCity[]> {
  return owmFetch<GeoCity[]>({
    endpoint: '/geo/1.0/direct',
    query: { q, limit: 5 },
    apiKey: opts.apiKey,
  });
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  opts: ApiOptions,
): Promise<GeoCity | null> {
  const res = await owmFetch<GeoCity[]>({
    endpoint: '/geo/1.0/reverse',
    query: { lat, lon, limit: 1 },
    apiKey: opts.apiKey,
  });
  return res[0] ?? null;
}

export function getCurrentWeather(
  lat: number,
  lon: number,
  opts: ApiOptions,
): Promise<CurrentWeather> {
  return owmFetch<CurrentWeather>({
    endpoint: '/data/2.5/weather',
    query: { lat, lon },
    apiKey: opts.apiKey,
  });
}

export function getForecast(
  lat: number,
  lon: number,
  opts: ApiOptions,
): Promise<ForecastResponse> {
  return owmFetch<ForecastResponse>({
    endpoint: '/data/2.5/forecast',
    query: { lat, lon },
    apiKey: opts.apiKey,
  });
}

const WEEKDAY_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * Aggregate the 3-hour-step forecast list (~40 items, 5 days) into 5 daily summaries.
 * Day key is computed in the location's local time using the timezone offset returned
 * by /forecast (city.timezone, in seconds).
 */
export function aggregateDaily(res: ForecastResponse): DailyForecast[] {
  const tz = res.city.timezone ?? 0;
  const byDay = new Map<string, ForecastItem[]>();

  for (const item of res.list) {
    const localMs = (item.dt + tz) * 1000;
    const d = new Date(localMs);
    // Build YYYY-MM-DD from UTC of shifted timestamp
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(item);
  }

  const days = [...byDay.entries()].slice(0, 6); // up to 6 unique days, we'll trim to 5 below
  const out: DailyForecast[] = [];

  // Today (index 0) is current day — skip it for the forecast strip, show next 5.
  const startIdx = days.length > 5 ? 1 : 0;

  for (let i = startIdx; i < days.length && out.length < 5; i++) {
    const [key, items] = days[i];
    let tMin = Infinity;
    let tMax = -Infinity;
    let pop = 0;
    for (const it of items) {
      tMin = Math.min(tMin, it.main.temp_min, it.main.temp);
      tMax = Math.max(tMax, it.main.temp_max, it.main.temp);
      pop = Math.max(pop, it.pop ?? 0);
    }
    // Pick representative condition: prefer item around 12:00 local; fallback to middle item.
    const noonItem =
      items.find((it) => {
        const local = new Date((it.dt + tz) * 1000);
        return local.getUTCHours() === 12;
      }) ?? items[Math.floor(items.length / 2)];

    const localNoon = new Date((noonItem.dt + tz) * 1000);
    const weekday = WEEKDAY_ZH[localNoon.getUTCDay()];

    out.push({
      date: key,
      weekday,
      tempMin: tMin,
      tempMax: tMax,
      condition: noonItem.weather[0],
      pop,
    });
  }

  return out;
}
