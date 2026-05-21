import { themeOf } from '@/utils/weatherTheme';

/**
 * Small inline-SVG glyph used in the 5-day forecast strip. Drawn from scratch
 * (not a generic icon set) to match the editorial atmosphere of the app.
 */
export function WeatherIcon({
  weatherId,
  night = false,
  className,
  size = 28,
}: {
  weatherId: number;
  night?: boolean;
  className?: string;
  size?: number;
}) {
  const theme = themeOf(weatherId, night);
  const common = {
    width: size,
    height: size,
    className,
    'aria-hidden': true,
  };

  switch (theme) {
    case 'clear-day':
      return (
        <svg {...common} viewBox="0 0 36 36" style={{ color: '#d97706' }}>
          <circle cx="18" cy="18" r="6" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="3" x2="18" y2="8" />
            <line x1="18" y1="28" x2="18" y2="33" />
            <line x1="3" y1="18" x2="8" y2="18" />
            <line x1="28" y1="18" x2="33" y2="18" />
            <line x1="7.5" y1="7.5" x2="11" y2="11" />
            <line x1="25" y1="25" x2="28.5" y2="28.5" />
            <line x1="28.5" y1="7.5" x2="25" y2="11" />
            <line x1="11" y1="25" x2="7.5" y2="28.5" />
          </g>
        </svg>
      );
    case 'clear-night':
      return (
        <svg {...common} viewBox="0 0 36 36">
          <path
            d="M 26 22 a 10 10 0 1 1 -12 -12 a 8 8 0 0 0 12 12 z"
            fill="#fff"
            opacity="0.95"
          />
        </svg>
      );
    case 'cloudy':
      return (
        <svg {...common} viewBox="0 0 40 36" style={{ color: 'currentColor' }}>
          <path
            d="M 8 18 Q 8 10 16 11 Q 19 4 27 8 Q 35 7 36 15 Q 39 15 39 20 Q 39 25 33 25 L 11 25 Q 5 25 8 18 Z"
            fill="#c9ccd2"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </svg>
      );
    case 'rain':
      return (
        <svg {...common} viewBox="0 0 40 36" style={{ color: 'currentColor' }}>
          <path
            d="M 8 16 Q 8 10 14 11 Q 17 5 23 8 Q 29 7 30 13 Q 33 13 33 17 Q 33 21 28 21 L 11 21 Q 6 21 8 16 Z"
            fill="#7e8896"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <g stroke="#4a6580" strokeWidth="1.4" strokeLinecap="round">
            <line x1="14" y1="25" x2="12" y2="31" />
            <line x1="20" y1="25" x2="18" y2="31" />
            <line x1="26" y1="25" x2="24" y2="31" />
          </g>
        </svg>
      );
    case 'snow':
      return (
        <svg {...common} viewBox="0 0 40 36" style={{ color: 'currentColor' }}>
          <path
            d="M 8 16 Q 8 10 14 11 Q 17 5 23 8 Q 29 7 30 13 Q 33 13 33 17 Q 33 21 28 21 L 11 21 Q 6 21 8 16 Z"
            fill="#cbd5e1"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <g fill="#fff">
            <circle cx="14" cy="28" r="1.6" />
            <circle cx="20" cy="30" r="1.6" />
            <circle cx="26" cy="28" r="1.6" />
          </g>
        </svg>
      );
    case 'thunder':
      return (
        <svg {...common} viewBox="0 0 40 36" style={{ color: 'currentColor' }}>
          <path
            d="M 8 16 Q 8 10 14 11 Q 17 5 23 8 Q 29 7 30 13 Q 33 13 33 17 Q 33 21 28 21 L 11 21 Q 6 21 8 16 Z"
            fill="#3b4759"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M 18 22 L 16 28 L 20 28 L 17 35"
            fill="none"
            stroke="#fef3c7"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'mist':
      return (
        <svg {...common} viewBox="0 0 40 36" style={{ color: 'currentColor' }}>
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
            <line x1="6" y1="13" x2="34" y2="13" />
            <line x1="9" y1="19" x2="31" y2="19" />
            <line x1="6" y1="25" x2="34" y2="25" />
          </g>
        </svg>
      );
  }
}
