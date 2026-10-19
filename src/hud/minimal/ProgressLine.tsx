import type { CSSProperties } from 'react';
import styles from './ProgressLine.module.css';

// thin rounded progress track - `color` may be a plain color or a gradient, since it's applied as
// a background. Markers are 0-100 positions (e.g. waypoints along a route).
export function ProgressLine({
  percent,
  color,
  thickness = 3,
  markers = [],
  head = false,
}: {
  percent: number;
  color: string;
  thickness?: number;
  markers?: number[];
  head?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, percent));
  const style = { '--line-color': color, '--line-h': `${thickness}px` } as CSSProperties;
  return (
    <div className={styles.track} style={style}>
      <div className={styles.fill} style={{ width: `${pct}%` }} />
      {markers.map((m, i) => (
        <span key={i} className={`${styles.marker} ${m <= pct ? styles.passed : ''}`} style={{ left: `${m}%` }} />
      ))}
      {head && <span className={styles.head} style={{ left: `${pct}%` }} />}
    </div>
  );
}
