import type { CurrentWeather as CurrentWeatherT } from '@/api/types';
import { useUnitsStore } from '@/store/units';
import {
  formatCoord,
  formatDateLine,
  formatTemp,
  formatWind,
  utcOffsetLabel,
  windDirection,
} from '@/utils/format';
import type { Theme } from '@/utils/weatherTheme';
import { isDarkTheme } from '@/utils/weatherTheme';

interface Props {
  data: CurrentWeatherT;
  displayName: string; // Chinese name, comes from FavoriteCity / preferZhName
  theme: Theme;
}

export function CurrentWeather({ data, displayName, theme }: Props) {
  const { temp, wind } = useUnitsStore();
  const dark = isDarkTheme(theme);
  const muted = dark ? 'text-stone-200/70' : 'text-stone-700/70';
  const sub = dark ? 'text-stone-300/80' : 'text-stone-700/80';
  const dotMuted = dark ? 'opacity-40' : 'opacity-30';

  const dateLine = `${formatDateLine(data.dt, data.timezone)} ${utcOffsetLabel(data.timezone)}`;
  const description = data.weather[0]?.description ?? '';
  const visKm = (data.visibility / 1000).toFixed(0);

  return (
    <section className="px-6 md:px-10 pt-20 md:pt-24 max-w-[1280px] mx-auto">
      <p className={`font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase ${sub}`}>
        {dateLine}
      </p>

      <h1
        className="font-display-it leading-none mt-6 md:mt-8"
        style={{ fontSize: 'clamp(36px, 6vw, 56px)' }}
      >
        {displayName}
      </h1>
      <p className={`font-mono text-[10px] md:text-[11px] tracking-widest mt-1 md:mt-2 ${muted}`}>
        {data.sys.country} · {formatCoord(data.coord.lat, data.coord.lon)}
      </p>

      <div className="mt-2 flex items-start">
        <span
          className="font-display leading-none tabular"
          style={{
            fontSize: 'clamp(132px, 18vw, 240px)',
            letterSpacing: '-0.04em',
          }}
        >
          {formatTemp(data.main.temp, temp).slice(0, -1)}
          <span className="deg">°</span>
        </span>
      </div>

      <p
        className="font-display-it leading-tight mt-1"
        style={{ fontSize: 'clamp(20px, 2.6vw, 34px)' }}
      >
        「{description}。」
      </p>

      <div className="mt-10 md:mt-12">
        <div className={`flex items-center gap-3 ${sub} text-[13px]`}>
          <span className={`font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase ${muted} mr-2`}>
            细节
          </span>
          <span className={`flex-1 h-px ${dark ? 'bg-white/15' : 'bg-stone-900/15'}`} />
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-7 gap-y-2 text-[13px] md:text-[14px]">
          <Stat label="体感" value={formatTemp(data.main.feels_like, temp)} />
          <Sep mute={dotMuted} />
          <Stat label="湿度" value={`${data.main.humidity}%`} />
          <Sep mute={dotMuted} />
          <Stat
            label="风"
            prefix={`${windDirection(data.wind.deg)} `}
            value={formatWind(data.wind.speed, wind)}
          />
          <Sep mute={dotMuted} />
          <Stat label="气压" value={`${data.main.pressure} hPa`} />
          <Sep mute={dotMuted} />
          <Stat label="能见度" value={`${visKm} km`} />
          <Sep mute={dotMuted} />
          <Stat label="云量" value={`${data.clouds.all}%`} />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  prefix,
}: {
  label: string;
  value: string;
  prefix?: string;
}) {
  return (
    <span>
      {label}{' '}
      {prefix ? <span>{prefix}</span> : null}
      <span className="font-mono tabular">{value}</span>
    </span>
  );
}

function Sep({ mute }: { mute: string }) {
  return <span className={mute}>·</span>;
}
