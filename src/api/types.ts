// OpenWeatherMap API response types & domain types

export interface GeoCity {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeather {
  coord: { lat: number; lon: number };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
  name: string;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface ForecastResponse {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    sunrise: number;
    sunset: number;
    timezone: number;
  };
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    feels_like: number;
  };
  weather: WeatherCondition[];
  wind: { speed: number; deg: number };
  pop: number;
  dt_txt: string;
}

// Aggregated daily summary (computed client-side from 3-hour steps)
export interface DailyForecast {
  date: string; // YYYY-MM-DD
  weekday: string; // 周一
  tempMin: number;
  tempMax: number;
  condition: WeatherCondition; // representative condition (mid-day or worst)
  pop: number; // 0-1, max of day
}

// Persisted in localStorage
export interface FavoriteCity {
  id: string; // `${lat},${lon}`
  name: string; // display name, prefers local_names.zh
  country: string;
  state?: string;
  lat: number;
  lon: number;
  addedAt: number;
}

// Normalised API error
export type ApiErrorCode =
  | 'INVALID_KEY'
  | 'RATE_LIMIT'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'UNKNOWN';

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;
  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
