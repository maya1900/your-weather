import { MapPin } from 'lucide-react';
import type { GeoStatus } from '@/hooks/useGeolocation';
import { type Theme, isDarkTheme } from '@/utils/weatherTheme';

interface Props {
  theme: Theme;
  geoStatus: GeoStatus;
  onRequestLocation: () => void;
}

export function EmptyState({ theme, geoStatus, onRequestLocation }: Props) {
  const dark = isDarkTheme(theme);
  const muted = dark ? 'text-stone-300/80' : 'text-stone-700/80';
  const strong = dark ? 'text-stone-50' : 'text-stone-900';

  return (
    <section className="px-6 md:px-10 pt-24 md:pt-36 max-w-[1280px] mx-auto">
      <p className={`font-mono text-[11px] tracking-[0.22em] uppercase ${muted}`}>
        your weather · 起点
      </p>
      <h2
        className={`font-display-it leading-none mt-6 ${strong}`}
        style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
      >
        从哪里开始?
      </h2>
      <p className={`font-display mt-3 text-[20px] md:text-[28px] ${muted}`}>
        Start anywhere — a city, a continent, your current sky.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        {geoStatus === 'idle' && (
          <button
            type="button"
            onClick={onRequestLocation}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full ring-1 ${
              dark
                ? 'ring-white/20 hover:bg-white/10 text-stone-100'
                : 'ring-stone-900/20 hover:bg-stone-900/8 text-stone-900'
            } transition text-[13px]`}
          >
            <MapPin size={14} strokeWidth={1.6} />
            使用我的位置
          </button>
        )}
        {geoStatus === 'loading' && (
          <span className={`text-[13px] ${muted}`}>正在定位…</span>
        )}
        {(geoStatus === 'denied' || geoStatus === 'error' || geoStatus === 'unsupported') && (
          <span className={`text-[13px] ${muted}`}>
            {geoStatus === 'denied' && '定位已拒绝 — 请用搜索框输入城市。'}
            {geoStatus === 'error' && '定位失败 — 请用搜索框输入城市。'}
            {geoStatus === 'unsupported' && '浏览器不支持定位 — 请用搜索框输入城市。'}
          </span>
        )}
      </div>
    </section>
  );
}
