import type { TempUnit, WindUnit } from '@/store/units';

export function celsiusTo(unit: TempUnit, c: number): number {
  return unit === 'C' ? c : (c * 9) / 5 + 32;
}

export function formatTemp(celsius: number, unit: TempUnit): string {
  return `${Math.round(celsiusTo(unit, celsius))}°`;
}

export function msTo(unit: WindUnit, ms: number): number {
  return unit === 'm/s' ? ms : ms * 3.6;
}

export function formatWind(ms: number, unit: WindUnit): string {
  const v = msTo(unit, ms);
  // 1 decimal for m/s under 10, else 0; for km/h always 0.
  const formatted = unit === 'm/s' && v < 10 ? v.toFixed(1) : Math.round(v).toString();
  return `${formatted} ${unit}`;
}

const COMPASS_ZH = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
export function windDirection(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const idx = Math.round(normalized / 45) % 8;
  return COMPASS_ZH[idx];
}

const WEEKDAY_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * All "local time" formatting uses the location's timezone offset (seconds from UTC)
 * returned by OpenWeatherMap. We shift the unix timestamp and then read UTC fields —
 * never the browser's local timezone — to keep displayed time matching the city.
 */
function shifted(dtSec: number, tzOffsetSec: number): Date {
  return new Date((dtSec + tzOffsetSec) * 1000);
}

export function formatTime(dtSec: number, tzOffsetSec: number): string {
  const d = shifted(dtSec, tzOffsetSec);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDateLine(dtSec: number, tzOffsetSec: number): string {
  const d = shifted(dtSec, tzOffsetSec);
  const y = d.getUTCFullYear();
  const mo = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const w = WEEKDAY_ZH[d.getUTCDay()];
  return `${y} · ${mo}月${day}日 · ${w} · ${formatTime(dtSec, tzOffsetSec)}`;
}

export function formatShortDate(dtSec: number, tzOffsetSec: number): string {
  const d = shifted(dtSec, tzOffsetSec);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

export function isNight(dtSec: number, sunriseSec: number, sunsetSec: number): boolean {
  return dtSec < sunriseSec || dtSec >= sunsetSec;
}

export function formatCoord(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`;
}

/**
 * Choose the best display name for a city: prefer Chinese (zh) from local_names if
 * present and non-empty, otherwise fall back to the romanised name.
 */
export function preferZhName(name: string, localNames?: Record<string, string>): string {
  const zh = localNames?.zh?.trim();
  return zh && zh.length > 0 ? zh : name;
}

export function utcOffsetLabel(tzOffsetSec: number): string {
  const sign = tzOffsetSec >= 0 ? '+' : '-';
  const abs = Math.abs(tzOffsetSec);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  if (minutes === 0) return `UTC${sign}${hours}`;
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`;
}
