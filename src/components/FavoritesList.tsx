import { X } from 'lucide-react';
import type { FavoriteCity } from '@/api/types';
import { useCurrentCityStore } from '@/store/currentCity';
import { useFavoritesStore } from '@/store/favorites';
import { type Theme, isDarkTheme } from '@/utils/weatherTheme';

interface Props {
  theme: Theme;
}

export function FavoritesList({ theme }: Props) {
  const items = useFavoritesStore((s) => s.items);
  const remove = useFavoritesStore((s) => s.remove);
  const current = useCurrentCityStore((s) => s.city);
  const setCity = useCurrentCityStore((s) => s.setCity);

  const dark = isDarkTheme(theme);
  const muted = dark ? 'text-stone-300/80' : 'text-stone-700/80';
  const strong = dark ? 'text-stone-50' : 'text-stone-900';

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-4">
        <span className={`font-mono text-[10px] tracking-[0.22em] uppercase ${muted}`}>收藏</span>
        <span className={`text-[13px] ${muted}`}>(尚未添加,点击温度卡上的「+」加入)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className={`font-mono text-[10px] tracking-[0.22em] uppercase ${muted}`}>收藏</span>
      <div className="flex items-center gap-4 md:gap-5 flex-wrap">
        {items.map((c) => {
          const isCurrent = current?.id === c.id;
          return (
            <FavChip
              key={c.id}
              city={c}
              isCurrent={isCurrent}
              dark={dark}
              strong={strong}
              muted={muted}
              onSelect={() => setCity(c)}
              onRemove={() => remove(c.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function FavChip({
  city,
  isCurrent,
  dark,
  strong,
  muted,
  onSelect,
  onRemove,
}: {
  city: FavoriteCity;
  isCurrent: boolean;
  dark: boolean;
  strong: string;
  muted: string;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <span
      className={`group inline-flex items-center gap-1.5 text-[13px] md:text-[13.5px] ${strong}`}
    >
      {isCurrent && (
        <span
          className={`w-1 h-1 rounded-full ${dark ? 'bg-stone-50' : 'bg-stone-900'}`}
        />
      )}
      <button
        type="button"
        onClick={onSelect}
        className={`font-display-it ${isCurrent ? '' : 'opacity-70 hover:opacity-100'} transition`}
      >
        {city.name}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className={`opacity-0 group-hover:opacity-70 hover:opacity-100 transition ${muted}`}
        aria-label={`移除 ${city.name}`}
      >
        <X size={12} strokeWidth={1.5} />
      </button>
    </span>
  );
}
