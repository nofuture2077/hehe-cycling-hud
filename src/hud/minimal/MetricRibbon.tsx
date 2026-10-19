import type { CSSProperties, ReactNode } from 'react';
import { MetricValue } from './Metric';
import { ProgressLine } from './ProgressLine';
import type { MetricDescriptor } from './metrics';
import styles from './MetricRibbon.module.css';

export interface RibbonSegment {
  key: string;
  color: string;
  percent: number;
  value: ReactNode;
  unit: string;
  label: string;
  fading?: boolean;
}

export function metricSegment(m: MetricDescriptor): RibbonSegment {
  return {
    key: m.id, color: m.color, percent: m.percent, value: <MetricValue m={m} />, unit: m.unit, label: m.label, fading: m.fading,
  };
}

// one frosted-glass strip split into equal segments, each topped by a thin accent line in the
// metric's color filled to its intensity - the only minimal layout piece that has a surface
export function MetricRibbon({ segments }: { segments: RibbonSegment[] }) {
  if (segments.length === 0) return null;
  return (
    <div className={styles.ribbon}>
      {segments.map((s) => (
        <div key={s.key} className={`${styles.segment} ${s.fading ? styles.fading : ''}`}>
          <ProgressLine percent={s.percent} color={s.color} thickness={3} />
          <div className={styles.value} style={{ '--metric-color': s.color } as CSSProperties}>
            {s.value}
            <span className={styles.unit}>{s.unit}</span>
          </div>
          <div className={styles.label}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
