import { ApiError } from './types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE = new Map<string, CacheEntry<unknown>>();
const TTL_MS = 10 * 60 * 1000;

const BASE = 'https://api.openweathermap.org';

export interface RequestParams {
  endpoint: string; // e.g. '/data/2.5/weather'
  query: Record<string, string | number | undefined>;
  apiKey: string;
  cache?: boolean;
}

function buildUrl({ endpoint, query, apiKey }: RequestParams): string {
  const url = new URL(endpoint, BASE);
  const merged: Record<string, string> = {
    appid: apiKey,
    lang: 'zh_cn',
    units: 'metric',
  };
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') merged[k] = String(v);
  }
  for (const [k, v] of Object.entries(merged)) url.searchParams.set(k, v);
  return url.toString();
}

function cacheKey(params: RequestParams): string {
  const { endpoint, query } = params;
  const sorted = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${endpoint}?${sorted}`;
}

export async function owmFetch<T>(params: RequestParams): Promise<T> {
  if (!params.apiKey) {
    throw new ApiError('INVALID_KEY', 'API key 缺失,请在设置中粘贴。');
  }

  const key = cacheKey(params);
  const useCache = params.cache !== false;

  if (useCache) {
    const hit = CACHE.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.data as T;
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(params));
  } catch (err) {
    throw new ApiError('NETWORK', `网络异常: ${(err as Error).message}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('INVALID_KEY', 'API key 无效,请检查后重新粘贴。', 401);
    }
    if (response.status === 404) {
      throw new ApiError('NOT_FOUND', '没有找到这个地点。', 404);
    }
    if (response.status === 429) {
      throw new ApiError('RATE_LIMIT', '请求过于频繁,请稍后再试。', 429);
    }
    throw new ApiError('UNKNOWN', `请求失败 (HTTP ${response.status})`, response.status);
  }

  const data = (await response.json()) as T;

  if (useCache) {
    CACHE.set(key, { data, expiresAt: Date.now() + TTL_MS });
  }

  return data;
}

export function clearCache() {
  CACHE.clear();
}
