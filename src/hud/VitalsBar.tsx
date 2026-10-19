import type { CSSProperties, ReactNode } from 'react';
import styles from './VitalsBar.module.css';

export function VitalsBar({
  icon,
  label,
  value,
  unit,
  percent,
  level,
  extreme,
  fading,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  unit: string;
  // 0-100, how full the track renders
  percent: number;
  // 1-5, picks which shared intensity bucket color the fill uses
  level: number;
  extreme?: boolean;
  fading?: boolean;
}) {
  const clampedLevel = Math.max(1, Math.min(5, level));
  const style = {
    '--bar-color': `var(--hud-b${clampedLevel}-color, var(--hud-accent, #fcee09))`,
    '--fill-pct': `${Math.max(0, Math.min(100, percent))}%`,
  } as CSSProperties;

  return (
    <div className={`${styles.wrap} ${fading ? styles.fadingOut : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>
          {icon}
          {label}
        </span>
        <span className={styles.value}>
          {value}
          <span className={styles.unit}>{unit}</span>
        </span>
      </div>
      <div className={`${styles.track} ${extreme ? styles.pulseExtreme : ''}`} style={style}>
        <div className={styles.fill} />
      </div>
    </div>
  );
}
