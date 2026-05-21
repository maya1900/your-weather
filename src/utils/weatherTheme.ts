export type Theme =
  | 'clear-day'
  | 'clear-night'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'thunder'
  | 'mist';

/**
 * Map an OpenWeatherMap weather id (e.g. 800, 500, 200) to a theme.
 * Reference: https://openweathermap.org/weather-conditions
 *   2xx — Thunderstorm
 *   3xx — Drizzle
 *   5xx — Rain
 *   6xx — Snow
 *   7xx — Atmosphere (haze, fog, dust ...)
 *   800 — Clear (day or night)
 *   80x — Clouds
 */
export function themeOf(weatherId: number, night: boolean): Theme {
  if (weatherId >= 200 && weatherId < 300) return 'thunder';
  if (weatherId >= 300 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return night ? 'clear-night' : 'clear-day';
  return 'cloudy';
}

/**
 * Heuristic for foreground brightness — used by components that need to flip
 * mute/strong tones based on whether the scene is dark or light.
 */
export function isDarkTheme(theme: Theme): boolean {
  return theme === 'clear-night' || theme === 'rain' || theme === 'thunder';
}
