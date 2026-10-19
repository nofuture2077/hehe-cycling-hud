import type { CSSProperties } from 'react';
import { NumberValue } from '../NumberValue';
import { fmt } from '../format';
import type { MetricDescriptor } from './metrics';
import styles from './Metric.module.css';

// plain "42,7" rather than NumberValue's superscript decimal, which reads too busy at light
// weights - NumberValue is only used for clock-style values (pause mm:ss)
export function MetricValue({ m }: { m: MetricDescriptor }) {
  if (m.decimal !== undefined) return <NumberValue n={m.value} decimal={m.decimal} separator={m.separator} />;
  return <>{fmt(m.value, m.digits)}</>;
}

// a bare value + unit (+ optional label/dot) with no surrounding panel - the basic text block
// every minimal layout is built from. Color only touches the unit and dot; the numeral stays white.
export function Metric({
  m,
  size = 'md',
  dot = false,
  showLabel = true,
  stacked = false,
}: {
  m: MetricDescriptor;
  size?: 'hero' | 'md' | 'sm';
  dot?: boolean;
  showLabel?: boolean;
  // unit under the value instead of beside it (e.g. inside a ring)
  stacked?: boolean;
}) {
  const style = { '--metric-color': m.color, '--zone': m.zone } as CSSProperties;
  return (
    <div className={`${styles.metric} ${styles[size]} ${stacked ? styles.stacked : ''} ${m.fading ? styles.fading : ''}`} style={style}>
      <span className={styles.value}>
        {dot && <span className={styles.dot} />}
        <MetricValue m={m} />
        <span className={styles.unit}>{m.unit}</span>
      </span>
      {showLabel && <span className={styles.label}>{m.label}</span>}
    </div>
  );
}
