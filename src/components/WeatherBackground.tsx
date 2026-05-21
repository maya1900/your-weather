import { useMemo } from 'react';
import type { Theme } from '@/utils/weatherTheme';

interface Props {
  theme: Theme;
  children: React.ReactNode;
}

/**
 * Full-bleed atmospheric backdrop. Picks a scene class from index.css and layers
 * theme-specific decorations (sun, moon, rain, snow, fog, stars, lightning).
 * All animations are pure CSS so they keep ticking with no React work.
 */
export function WeatherBackground({ theme, children }: Props) {
  return (
    <div className={`scene-${theme} grain min-h-screen w-full relative overflow-hidden`}>
      <Decorations theme={theme} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Decorations({ theme }: { theme: Theme }) {
  switch (theme) {
    case 'clear-day':
      return <Sun />;
    case 'clear-night':
      return (
        <>
          <Stars />
          <Moon />
        </>
      );
    case 'cloudy':
      return <Clouds />;
    case 'rain':
      return (
        <>
          <RainClouds />
          <Rain density={80} />
        </>
      );
    case 'snow':
      return (
        <>
          <SnowMountain />
          <Snow density={40} />
        </>
      );
    case 'thunder':
      return (
        <>
          <RainClouds dark />
          <Rain density={50} />
          <LightningBolt />
        </>
      );
    case 'mist':
      return <Fog />;
    default:
      return null;
  }
}

function Sun() {
  return (
    <svg
      viewBox="0 0 600 600"
      className="absolute pointer-events-none"
      style={{ top: '5%', right: '4%', width: '38%', maxWidth: 520 }}
      aria-hidden
    >
      <defs>
        <radialGradient id="sun-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffbe8" />
          <stop offset="45%" stopColor="#ffe8a3" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe8a3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun-disc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8d6" />
          <stop offset="80%" stopColor="#ffeba8" />
          <stop offset="100%" stopColor="#f4d077" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="260" fill="url(#sun-core)" className="sun-pulse" />
      <g
        className="sun-rays"
        stroke="#fff4c2"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.75}
      >
        <line x1="300" y1="40" x2="300" y2="105" />
        <line x1="300" y1="495" x2="300" y2="560" />
        <line x1="40" y1="300" x2="105" y2="300" />
        <line x1="495" y1="300" x2="560" y2="300" />
        <line x1="115" y1="115" x2="160" y2="160" />
        <line x1="440" y1="440" x2="485" y2="485" />
        <line x1="485" y1="115" x2="440" y2="160" />
        <line x1="160" y1="440" x2="115" y2="485" />
        <line x1="218" y1="55" x2="232" y2="115" opacity="0.5" />
        <line x1="382" y1="55" x2="368" y2="115" opacity="0.5" />
        <line x1="55" y1="218" x2="115" y2="232" opacity="0.5" />
        <line x1="55" y1="382" x2="115" y2="368" opacity="0.5" />
        <line x1="545" y1="218" x2="485" y2="232" opacity="0.5" />
        <line x1="545" y1="382" x2="485" y2="368" opacity="0.5" />
        <line x1="218" y1="545" x2="232" y2="485" opacity="0.5" />
        <line x1="382" y1="545" x2="368" y2="485" opacity="0.5" />
      </g>
      <circle cx="300" cy="300" r="130" fill="url(#sun-disc)" />
    </svg>
  );
}

function Moon() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute pointer-events-none"
      style={{ top: '8%', right: '8%', width: '24%', maxWidth: 280 }}
      aria-hidden
    >
      <defs>
        <radialGradient id="moon-body" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#d8d5e8" />
        </radialGradient>
        <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8e1ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e8e1ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#moon-glow)" />
      <circle cx="100" cy="100" r="42" fill="url(#moon-body)" />
      <circle cx="92" cy="92" r="6" fill="#c8c4dc" opacity="0.6" />
      <circle cx="115" cy="108" r="4" fill="#c8c4dc" opacity="0.5" />
      <circle cx="100" cy="118" r="3" fill="#c8c4dc" opacity="0.5" />
    </svg>
  );
}

function Clouds() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <path
        d="M 30 200 Q 30 140 90 145 Q 110 90 180 105 Q 240 70 300 110 Q 360 105 365 165 Q 395 170 395 215 Q 395 250 350 250 L 60 250 Q 5 245 30 200 Z"
        fill="#e8eaef"
        opacity="0.55"
      />
      <path
        d="M 80 320 Q 80 270 140 275 Q 160 235 220 245 Q 280 220 340 255 Q 380 260 380 300 Q 380 335 340 335 L 100 335 Q 55 330 80 320 Z"
        fill="#d4d7de"
        opacity="0.55"
      />
      <path
        d="M 10 110 Q 10 75 70 78 Q 90 50 150 60 Q 200 45 240 70 Q 280 75 285 110 Q 310 115 305 145 Q 300 165 270 165 L 35 165 Q -5 150 10 110 Z"
        fill="#dee1e7"
        opacity="0.4"
      />
    </svg>
  );
}

function RainClouds({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      viewBox="0 0 800 200"
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ height: '28%', opacity: dark ? 0.65 : 0.5 }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M -50 200 Q 30 130 100 150 Q 130 80 220 110 Q 280 60 360 100 Q 440 70 520 110 Q 600 80 690 130 Q 770 120 850 180 L 850 250 L -50 250 Z"
        fill={dark ? '#0a0716' : '#101622'}
      />
      <path
        d="M -50 200 Q 80 160 160 180 Q 220 120 310 150 Q 390 130 460 160 Q 560 130 640 170 Q 750 160 850 200 L 850 250 L -50 250 Z"
        fill={dark ? '#15102b' : '#1b2434'}
        opacity="0.7"
      />
    </svg>
  );
}

function Rain({ density }: { density: number }) {
  const drops = useMemo(() => {
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      left: Math.random() * 110 - 5,
      dur: 0.5 + Math.random() * 0.7,
      delay: Math.random() * 2,
      height: 50 + Math.random() * 80,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [density]);

  return (
    <div className="rain-layer">
      {drops.map((d) => (
        <span
          key={d.id}
          className="raindrop"
          style={{
            left: `${d.left}%`,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
            height: `${d.height}px`,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}

function Snow({ density }: { density: number }) {
  const flakes = useMemo(() => {
    const glyphs = ['·', '•', '✦', '❄', '*'];
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
      left: Math.random() * 100,
      size: 8 + Math.random() * 14,
      dur: 5 + Math.random() * 7,
      delay: Math.random() * 5,
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, [density]);

  return (
    <div className="snow-layer">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}px`,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
            opacity: f.opacity,
          }}
        >
          {f.glyph}
        </span>
      ))}
    </div>
  );
}

function SnowMountain() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute bottom-0 left-0 w-full pointer-events-none"
      style={{ opacity: 0.3 }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M 0 400 L 0 280 L 80 220 L 160 290 L 240 200 L 320 270 L 400 230 L 400 400 Z"
        fill="#9aa0b3"
      />
    </svg>
  );
}

function Stars() {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 70,
      size: 1 + Math.random() * 2.5,
      dur: 2 + Math.random() * 4,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div className="star-layer">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Fog() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="fog-band" style={{ top: '25%', animationDuration: '30s' }} />
      <div className="fog-band" style={{ top: '50%', animationDuration: '45s', height: 80 }} />
      <div className="fog-band" style={{ top: '70%', animationDuration: '38s' }} />
    </div>
  );
}

function LightningBolt() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <path
        d="M 250 90 L 220 180 L 245 180 L 215 280 L 280 160 L 250 160 L 280 90 Z"
        fill="#fffaa3"
        stroke="#fff"
        strokeWidth="1"
        className="bolt"
      />
    </svg>
  );
}
