import { Loader2, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FavoriteCity, GeoCity } from '@/api/types';
import { useCitySearch } from '@/hooks/useCitySearch';
import { useCurrentCityStore } from '@/store/currentCity';
import { preferZhName } from '@/utils/format';
import { type Theme, isDarkTheme } from '@/utils/weatherTheme';

interface Props {
  theme: Theme;
}

function toFavoriteCity(g: GeoCity): FavoriteCity {
  return {
    id: `${g.lat},${g.lon}`,
    name: preferZhName(g.name, g.local_names),
    country: g.country,
    state: g.state,
    lat: g.lat,
    lon: g.lon,
    addedAt: Date.now(),
  };
}

export function SearchBar({ theme }: Props) {
  const dark = isDarkTheme(theme);
  const setCity = useCurrentCityStore((s) => s.setCity);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { loading, results, error } = useCitySearch(query);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function handleSelect(g: GeoCity) {
    setCity(toFavoriteCity(g));
    setQuery('');
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results[0]) handleSelect(results[0]);
  }

  const fieldClass = dark
    ? 'bg-white/8 ring-white/15 text-stone-50 placeholder:text-stone-400'
    : 'bg-white/30 ring-stone-900/10 text-stone-900 placeholder:text-stone-600/70';
  const dropdownClass = dark
    ? 'bg-stone-950/95 ring-white/10 text-stone-100'
    : 'bg-white/95 ring-stone-900/10 text-stone-900';

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[320px]">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 px-4 py-2 rounded-full ring-1 backdrop-blur-[2px] ${fieldClass}`}
      >
        <Search size={14} strokeWidth={1.6} className="opacity-70" />
        <input
          type="text"
          placeholder="搜索城市 (中/英/拼音)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="bg-transparent outline-none flex-1 text-[13px]"
        />
        {loading && <Loader2 size={14} className="animate-spin opacity-70" />}
      </form>

      {open && query.trim() && (
        <div
          className={`absolute left-0 right-0 mt-2 rounded-xl ring-1 shadow-2xl overflow-hidden text-[13px] z-30 ${dropdownClass}`}
        >
          {loading && (
            <p className="px-4 py-3 text-stone-500 text-[12px]">搜索中…</p>
          )}
          {!loading && error && (
            <p className="px-4 py-3 text-red-500 text-[12px]">{error.message}</p>
          )}
          {!loading && !error && results.length === 0 && (
            <p className="px-4 py-3 text-stone-500 text-[12px]">没有找到这个城市</p>
          )}
          {!loading && results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((g, i) => (
                <li key={`${g.lat},${g.lon},${i}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(g)}
                    className={`w-full text-left px-4 py-2.5 flex items-baseline justify-between gap-3 hover:${dark ? 'bg-white/8' : 'bg-stone-900/5'} transition`}
                  >
                    <span>
                      <span className="font-display-it text-[15px]">
                        {preferZhName(g.name, g.local_names)}
                      </span>{' '}
                      <span className="opacity-60 text-[11px]">{g.name}</span>
                    </span>
                    <span className="font-mono text-[10px] tracking-widest opacity-60">
                      {g.state ? `${g.state} · ` : ''}{g.country}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
