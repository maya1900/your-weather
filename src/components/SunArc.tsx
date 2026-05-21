import { formatTime } from '@/utils/format';
import type { Theme } from '@/utils/weatherTheme';
import { isDarkTheme } from '@/utils/weatherTheme';

interface Props {
  sunrise: number; // unix sec
  sunset: number;
  now: number;
  tzOffsetSec: number;
  theme: Theme;
}

/**
 * Sunrise → sunset arc with a small dot indicating where the sun is right now.
 * Progress clamps to [0, 1] — before sunrise the dot sits at the left, after
 * sunset at the right, so the visual stays coherent.
 */
export function SunArc({ sunrise, sunset, now, tzOffsetSec, theme }: Props) {
  const dark = isDarkTheme(theme);
  const muted = dark ? 'text-stone-300/80' : 'text-stone-700/80';
  const strong = dark ? 'text-stone-50' : 'text-stone-900';

  const total = sunset - sunrise;
  const progress = total > 0 ? Math.min(Math.max((now - sunrise) / total, 0), 1) : 0;

  // Arc parameters — same path as the mockup
  const startX = 12;
  const endX = 588;
  const cx = startX + progress * (endX - startX);
  // y on a quadratic curve: y = (1 - t)^2 * y0 + 2(1-t)t * yc + t^2 * y1
  // with y0 = 60, yc = -30, y1 = 60
  const t = progress;
  const cy = (1 - t) ** 2 * 60 + 2 * (1 - t) * t * -30 + t ** 2 * 60;

  return (
    <div className="flex-1 min-w-[240px]">
      <svg viewBox="0 0 600 70" className="w-full h-10 md:h-12" aria-hidden>
        <path
          d="M 12 60 Q 300 -30 588 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="2 4"
          opacity={dark ? 0.5 : 0.4}
        />
        <line x1={startX} y1="56" x2={startX} y2="66" stroke="currentColor" strokeWidth="0.8" />
        <line x1={endX} y1="56" x2={endX} y2="66" stroke="currentColor" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r="5" fill={dark ? '#e6e9f0' : '#fff8d6'} stroke={dark ? '#fff' : '#e6a85a'} strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r="11" fill={dark ? '#e6e9f0' : '#fff8d6'} opacity="0.25" />
      </svg>
      <div className={`flex justify-between font-mono text-[9px] md:text-[10px] tracking-widest mt-1 ${muted}`}>
        <span>日出 {formatTime(sunrise, tzOffsetSec)}</span>
        <span className={`font-display-it not-italic ${strong}`}>
          现在 {formatTime(now, tzOffsetSec)}
        </span>
        <span>{formatTime(sunset, tzOffsetSec)} 日落</span>
      </div>
    </div>
  );
}
