import type { CSSProperties, ReactNode } from 'react';
import { fmt } from '../format';
import { METRIC_COLORS } from './metrics';
import type { HudContext } from '../context';
import styles from './InlineStats.module.css';

// location as a single line of plain text ("🇩🇪 Zugspitze · 18° · 14:32") - honors the same
// visible.location* flags LocationChip does, just without the chip
export function LocationLine({ ctx }: { ctx: HudContext }) {
  const { data, config } = ctx;
  const { visible } = config;
  if (!visible.location) return null;

  const place = [visible.locationCity && data.city, visible.locationRegion && data.region, visible.locationCountry && data.country]
    .filter(Boolean)
    .join(', ');
  const parts: ReactNode[] = [];
  if (place) parts.push(place);
  if (visible.locationTemperature && data.temperatureC != null) parts.push(`${Math.round(data.temperatureC)}°`);
  if (visible.locationLocalTime && data.localTime) parts.push(data.localTime);
  if (parts.length === 0) return null;

  return (
    <div className={styles.location}>
      {visible.locationFlag && data.countryFlag && <span className={styles.flag}>{data.countryFlag}</span>}
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className={styles.sep}>·</span>}
          {p}
        </span>
      ))}
    </div>
  );
}

function Stat({ glyph, color, children }: { glyph: string; color: string; children: ReactNode }) {
  return (
    <span className={styles.stat} style={{ '--stat-color': color } as CSSProperties}>
      <span className={styles.glyph}>{glyph}</span>
      {children}
    </span>
  );
}

// distance + elevation (+ split / gpx remaining) as one row of glyph-led numbers - same inputs as
// StatsCardWidget. `skipRemainingDistance` lets a layout that already shows it elsewhere (float's
// route line) avoid printing it twice.
export function StatsLine({ ctx, skipRemainingDistance = false }: { ctx: HudContext; skipRemainingDistance?: boolean }) {
  const { data, config, visibility, gpx } = ctx;
  const { visible } = config;
  if (!visible.distance && !visibility.showElevation) return null;

  return (
    <div className={styles.stats}>
      {visible.distance && (
        <Stat glyph="→" color={METRIC_COLORS.distance}>
          {fmt(visible.split ? data.splitDistanceKm : data.distanceKm, 1)}
          <span className={styles.unit}>km</span>
          {visible.split && (
            <span className={styles.secondary}>
              / {fmt(data.distanceKm, 1)}
            </span>
          )}
        </Stat>
      )}
      {visibility.showElevation && (
        <>
          <Stat glyph="↑" color={METRIC_COLORS.elev}>
            {fmt(visible.split ? data.splitElevationGainM : data.elevationGainM)}
            <span className={styles.unit}>m</span>
          </Stat>
          <Stat glyph="↓" color={METRIC_COLORS.hr}>
            {fmt(visible.split ? data.splitElevationLossM : data.elevationLossM)}
            <span className={styles.unit}>m</span>
          </Stat>
        </>
      )}
      {visibility.showGpxRemainingDistance && !skipRemainingDistance && (
        <Stat glyph="⚑" color={METRIC_COLORS.distance}>
          {fmt(gpx.remainingDistanceKm, 1)}
          <span className={styles.unit}>km to go</span>
        </Stat>
      )}
      {visibility.showGpxRemainingElevation && (
        <Stat glyph="⤒" color={METRIC_COLORS.elev}>
          {fmt(gpx.remainingElevationGainM)}
          <span className={styles.unit}>m to climb</span>
        </Stat>
      )}
    </div>
  );
}
