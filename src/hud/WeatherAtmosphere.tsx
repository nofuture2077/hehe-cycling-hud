import type { CSSProperties, ReactNode } from 'react';
import { type WeatherKind, weatherKind } from './WeatherIcon';
import styles from './WeatherAtmosphere.module.css';

// The weather happening around the text of the float layout's info cluster instead of an icon: rain streaks falling
// behind the lines, snow drifting, a warm glow for sun (stars at night), slow cloud shadows, fog banks, gusts of wind,
// and in a storm lightning lighting up the letters. It sits behind the text and fades out at its edges; the text
// keeps its shadow, so it stays readable. Wraps the text, nothing around it for an unknown condition.

// a steady spread of particles: the same on every render, so they don't jump when the data updates
const spread = (i: number, salt: number) => ((Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1 + 1) % 1;

function Particles({ count, className, fall }: { count: number; className: string; fall: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={className}
          style={
            {
              left: `${spread(i, 1) * 100}%`,
              '--y': `${spread(i, 5) * 100}%`,
              animationDuration: `${fall * (0.8 + spread(i, 2) * 0.4)}s`,
              animationDelay: `${-spread(i, 3) * fall}s`,
              opacity: 0.5 + spread(i, 4) * 0.5,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

const RAIN: Partial<Record<WeatherKind, number>> = { drizzle: 20, rain: 44, heavyRain: 80, storm: 56 };

function Scene({ kind, night }: { kind: WeatherKind; night: boolean }) {
  return (
    <>
      {kind === 'clear' && <span className={night ? styles.night : styles.sun} />}
      {kind === 'clear' && night && <Particles count={14} className={styles.star} fall={3} />}
      {kind === 'partly' && <span className={night ? styles.night : styles.sun} />}
      {(kind === 'partly' || kind === 'cloudy') && (
        <>
          <span className={styles.cloud} />
          <span className={`${styles.cloud} ${styles.cloudLate}`} />
        </>
      )}
      {kind === 'fog' && (
        <>
          <span className={styles.fog} />
          <span className={`${styles.fog} ${styles.fogLate}`} />
        </>
      )}
      {kind === 'wind' && <Particles count={10} className={styles.gust} fall={1.6} />}
      {RAIN[kind] && <Particles count={RAIN[kind]!} className={styles.rain} fall={kind === 'drizzle' ? 1.4 : 0.8} />}
      {kind === 'snow' && <Particles count={40} className={styles.snow} fall={5} />}
      {kind === 'storm' && <span className={styles.flash} />}
    </>
  );
}

export function WeatherAtmosphere({
  condition,
  isDaylight,
  children,
}: {
  condition: string | null;
  isDaylight: boolean | null;
  children: ReactNode;
}) {
  const kind = weatherKind(condition);
  if (!kind) return <div>{children}</div>;

  return (
    <div className={`${styles.atmosphere} ${kind === 'storm' ? styles.storm : ''}`}>
      <div className={styles.scene} aria-hidden="true">
        <Scene kind={kind} night={isDaylight === false} />
      </div>
      {children}
    </div>
  );
}
