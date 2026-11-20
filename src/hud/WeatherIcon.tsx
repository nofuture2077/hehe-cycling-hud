import { type CSSProperties, type ReactNode, useId } from 'react';
import styles from './WeatherIcon.module.css';

// An animated icon for the weather Moblin sends (WeatherKit's WeatherCondition raw value): turning sun rays, drifting
// clouds, falling rain or snow, a flashing bolt, moving fog or wind lines. Clouds take the text color, the rest has
// its own (sun, rain and bolt colors, each a --hud-weather-* variable a theme may set). Nothing for an unknown value.
// Everything stays inside the 24x24 box, so a big icon is never cut off.

type Kind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'heavyRain' | 'snow' | 'storm' | 'wind';

const KINDS: Record<string, Kind> = {
  clear: 'clear',
  mostlyClear: 'clear',
  hot: 'clear',
  partlyCloudy: 'partly',
  mostlyCloudy: 'cloudy',
  cloudy: 'cloudy',
  foggy: 'fog',
  haze: 'fog',
  smoky: 'fog',
  blowingDust: 'fog',
  breezy: 'wind',
  windy: 'wind',
  drizzle: 'drizzle',
  freezingDrizzle: 'drizzle',
  rain: 'rain',
  sunShowers: 'rain',
  freezingRain: 'rain',
  hail: 'rain',
  heavyRain: 'heavyRain',
  snow: 'snow',
  flurries: 'snow',
  sunFlurries: 'snow',
  heavySnow: 'snow',
  blizzard: 'snow',
  blowingSnow: 'snow',
  sleet: 'snow',
  wintryMix: 'snow',
  frigid: 'snow',
  thunderstorms: 'storm',
  isolatedThunderstorms: 'storm',
  scatteredThunderstorms: 'storm',
  strongStorms: 'storm',
  tropicalStorm: 'storm',
  hurricane: 'storm',
};

const CLOUD = 'M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 11a3.5 3.5 0 0 0 0 7z';

function Sun({ small = false }: { small?: boolean }) {
  return (
    <g className={styles.sunGroup} transform={small ? 'scale(0.7)' : undefined}>
      <g className={styles.rays}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line key={angle} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${angle} 12 12)`} />
        ))}
      </g>
      <circle className={styles.sun} cx="12" cy="12" r="4.5" />
    </g>
  );
}

function Moon({ small = false }: { small?: boolean }) {
  return (
    <path
      className={styles.moon}
      transform={small ? 'scale(0.7)' : undefined}
      d="M15.5 4.5a7.5 7.5 0 1 0 4 13.5A8 8 0 0 1 15.5 4.5z"
    />
  );
}

function Cloud({ offset = 0 }: { offset?: number }) {
  return <path className={styles.cloud} d={CLOUD} transform={`translate(0 ${offset})`} />;
}

// drops or flakes under the cloud, each starting a little later
function Falling({ count, flakes = false }: { count: number; flakes?: boolean }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = 7 + (i * 10) / Math.max(count - 1, 1);
        const style = { animationDelay: `${(i * 0.37) % 1.1}s` } as CSSProperties;
        return flakes ? (
          <circle key={i} className={styles.flake} cx={x} cy="16" r="1" style={style} />
        ) : (
          <line key={i} className={styles.drop} x1={x} y1="15" x2={x - 0.8} y2="17" style={style} />
        );
      })}
    </g>
  );
}

// what lies behind the front cloud of partly cloudy and cloudy is cut out where the cloud is, so it doesn't show
// through a see-through cloud (the float layout's big icon)
function BehindCloud({ id, offset, children }: { id: string; offset: number; children: ReactNode }) {
  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#fff" />
        <g className={styles.drift}>
          <path d={CLOUD} transform={`translate(0 ${offset})`} fill="#000" stroke="#000" strokeWidth="1.2" />
        </g>
      </mask>
      <g mask={`url(#${id})`}>{children}</g>
    </>
  );
}

export function WeatherIcon({ condition, isDaylight }: { condition: string | null; isDaylight: boolean | null }) {
  const maskId = useId();
  const kind = condition ? KINDS[condition] : undefined;
  if (!kind) return null;
  const night = isDaylight === false;

  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      {kind === 'clear' && (night ? <Moon /> : <Sun />)}
      {kind === 'partly' && (
        <>
          <BehindCloud id={maskId} offset={1.5}>
            {night ? <Moon small /> : <Sun small />}
          </BehindCloud>
          <g className={styles.drift}>
            <Cloud offset={1.5} />
          </g>
        </>
      )}
      {kind === 'cloudy' && (
        <>
          <BehindCloud id={maskId} offset={1}>
            <g className={styles.driftSlow} opacity="0.55">
              <path className={styles.cloud} d={CLOUD} transform="translate(0.5 -2) scale(0.8)" />
            </g>
          </BehindCloud>
          <g className={styles.drift}>
            <Cloud offset={1} />
          </g>
        </>
      )}
      {kind === 'fog' && (
        <g className={styles.fog}>
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="2" y1="12" x2="18" y2="12" />
          <line x1="6" y1="16" x2="22" y2="16" />
        </g>
      )}
      {kind === 'wind' && (
        <g className={styles.wind}>
          <path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5" />
          <path d="M3 13h15a2.5 2.5 0 1 1-2.5 2.5" />
          <path d="M3 17h7" />
        </g>
      )}
      {(kind === 'drizzle' || kind === 'rain' || kind === 'heavyRain' || kind === 'snow' || kind === 'storm') && (
        <>
          <Cloud offset={-4} />
          {kind === 'drizzle' && <Falling count={2} />}
          {kind === 'rain' && <Falling count={3} />}
          {kind === 'heavyRain' && <Falling count={5} />}
          {kind === 'snow' && <Falling count={3} flakes />}
          {kind === 'storm' && (
            <>
              <Falling count={2} />
              <path className={styles.bolt} d="M13 13l-3 5h3l-1.5 4.5L16 16h-3l1.5-3z" />
            </>
          )}
        </>
      )}
    </svg>
  );
}

WeatherIcon.knows = (condition: string | null) => !!condition && condition in KINDS;
