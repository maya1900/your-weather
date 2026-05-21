import { ChevronDown, MapPin, Settings, Star } from 'lucide-react';
import { useUnitsStore } from '@/store/units';
import { useFavoritesStore } from '@/store/favorites';
import { useCurrentCityStore } from '@/store/currentCity';
import { type Theme, isDarkTheme } from '@/utils/weatherTheme';
import { SearchBar } from './SearchBar';

interface Props {
  theme: Theme;
  onOpenSettings: () => void;
}

export function TopBar({ theme, onOpenSettings }: Props) {
  const dark = isDarkTheme(theme);
  const current = useCurrentCityStore((s) => s.city);
  const tempUnit = useUnitsStore((s) => s.temp);
  const setTemp = useUnitsStore((s) => s.setTemp);
  const windUnit = useUnitsStore((s) => s.wind);
  const setWind = useUnitsStore((s) => s.setWind);

  const fg = dark ? 'text-stone-100' : 'text-stone-900';
  const muted = dark ? 'text-stone-300/80' : 'text-stone-700/80';

  return (
    <header
      className={`relative z-20 flex flex-wrap items-center gap-3 md:gap-6 justify-between px-6 md:px-10 py-5 text-[13px] ${fg}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <MapPin size={14} strokeWidth={1.6} />
        <span className="font-medium tracking-wide truncate">
          {current ? (
            <>
              {current.name}
              {current.country && (
                <span className={`ml-1.5 ${muted}`}>{current.country}</span>
              )}
            </>
          ) : (
            <span className={muted}>未选择城市</span>
          )}
        </span>
        <ChevronDown size={10} strokeWidth={1.8} className="opacity-50 shrink-0" />
        {current && <FavStar />}
      </div>

      <div className="order-3 md:order-2 w-full md:w-auto md:flex-1 md:max-w-[320px]">
        <SearchBar theme={theme} />
      </div>

      <div className="order-2 md:order-3 flex items-center gap-1 font-mono text-[11px] tracking-widest uppercase">
        <UnitBtn active={tempUnit === 'C'} dark={dark} onClick={() => setTemp('C')}>°c</UnitBtn>
        <UnitBtn active={tempUnit === 'F'} dark={dark} onClick={() => setTemp('F')}>°f</UnitBtn>
        <span className={`mx-2 opacity-30`}>|</span>
        <UnitBtn active={windUnit === 'm/s'} dark={dark} onClick={() => setWind('m/s')}>
          m/s
        </UnitBtn>
        <UnitBtn active={windUnit === 'km/h'} dark={dark} onClick={() => setWind('km/h')}>
          km/h
        </UnitBtn>
        <button
          type="button"
          onClick={onOpenSettings}
          className={`ml-2 p-1.5 rounded ${dark ? 'hover:bg-white/10' : 'hover:bg-stone-900/8'} transition`}
          aria-label="设置"
        >
          <Settings size={14} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}

function UnitBtn({
  children,
  active,
  dark,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  dark: boolean;
  onClick: () => void;
}) {
  const base = dark ? 'bg-white/10' : 'bg-stone-900/8';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded transition ${active ? base : 'opacity-50 hover:opacity-80'}`}
    >
      {children}
    </button>
  );
}

function FavStar() {
  const current = useCurrentCityStore((s) => s.city);
  const has = useFavoritesStore((s) => (current ? s.items.some((c) => c.id === current.id) : false));
  const add = useFavoritesStore((s) => s.add);
  const remove = useFavoritesStore((s) => s.remove);

  if (!current) return null;

  return (
    <button
      type="button"
      onClick={() => (has ? remove(current.id) : add(current))}
      className="ml-2 p-1 opacity-70 hover:opacity-100 transition"
      aria-label={has ? '取消收藏' : '加入收藏'}
      title={has ? '取消收藏' : '加入收藏'}
    >
      <Star
        size={14}
        strokeWidth={1.5}
        fill={has ? 'currentColor' : 'none'}
      />
    </button>
  );
}
