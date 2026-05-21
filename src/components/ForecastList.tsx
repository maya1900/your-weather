import type { DailyForecast } from '@/api/types';
import { useUnitsStore } from '@/store/units';
import { formatTemp } from '@/utils/format';
import type { Theme } from '@/utils/weatherTheme';
import { isDarkTheme } from '@/utils/weatherTheme';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  days: DailyForecast[];
  theme: Theme;
}

export function ForecastList({ days, theme }: Props) {
  const { temp } = useUnitsStore();
  const dark = isDarkTheme(theme);
  const muted = dark ? 'text-stone-300/80' : 'text-stone-700/70';
  const sub = dark ? 'text-stone-400' : 'text-stone-700/60';

  return (
    <section className="px-6 md:px-10 mt-10 md:mt-12 max-w-[1280px] mx-auto">
      <div className={`flex items-center gap-3 text-[13px]`}>
        <span className={`font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase ${muted} mr-2`}>
          未来五日
        </span>
        <span className={`flex-1 h-px ${dark ? 'bg-white/15' : 'bg-stone-900/15'}`} />
      </div>

      <div
        className={`mt-4 grid grid-cols-5 ${dark ? 'divide-white/15' : 'divide-stone-900/15'} divide-x`}
      >
        {days.map((d) => (
          <div key={d.date} className="px-2 md:px-4">
            <p
              className="font-display-it"
              style={{ fontSize: 'clamp(13px, 1.4vw, 18px)' }}
            >
              {d.weekday}
            </p>
            <p className={`font-mono text-[9px] md:text-[10px] tracking-widest ${sub}`}>
              {d.date.slice(5).replace('-', '/')}
            </p>

            <div className="mt-2 md:mt-3 h-8 md:h-9 flex items-center">
              <WeatherIcon weatherId={d.condition.id} size={32} className="md:w-9 md:h-9" />
            </div>

            <p
              className="font-display mt-2 md:mt-3 tabular"
              style={{ fontSize: 'clamp(15px, 1.8vw, 22px)' }}
            >
              {formatTemp(d.tempMax, temp)}
              <span className={`opacity-50 ml-1`} style={{ fontSize: '0.72em' }}>
                / {formatTemp(d.tempMin, temp)}
              </span>
            </p>
            <p className={`font-mono text-[9px] md:text-[10px] tracking-wider mt-1 ${sub}`}>
              降水 {Math.round(d.pop * 100)}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
