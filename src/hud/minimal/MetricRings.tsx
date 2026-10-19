import { Metric } from './Metric';
import type { MetricDescriptor } from './metrics';
import styles from './MetricRings.module.css';

const SIZE = 260;
const STROKE = 18;
const GAP = 6;

function Ring({ radius, m }: { radius: number; m: MetricDescriptor }) {
  const c = 2 * Math.PI * radius;
  const pct = m.visible ? m.percent : 0;
  return (
    <g className={m.fading ? styles.fading : undefined}>
      <circle className={styles.track} r={radius} style={{ stroke: m.color }} />
      <circle
        className={styles.fill}
        r={radius}
        style={{ stroke: m.color, strokeDasharray: c, strokeDashoffset: c * (1 - pct / 100) }}
      />
    </g>
  );
}

// activity-ring style vitals: one concentric arc per metric (outermost first), the primary
// metric (speed/pause) centered, and a dot legend underneath for whichever vitals are live. A
// hidden metric keeps its empty ring track so the rings never shift position.
export function MetricRings({ primary, vitals }: { primary: MetricDescriptor; vitals: MetricDescriptor[] }) {
  const outer = SIZE / 2 - STROKE / 2;
  const live = vitals.filter((m) => m.visible);
  return (
    <div className={styles.wrap}>
      <div className={styles.rings} style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`} style={{ strokeWidth: STROKE }}>
          {vitals.map((m, i) => (
            <Ring key={m.id} radius={outer - i * (STROKE + GAP)} m={m} />
          ))}
        </svg>
        {primary.visible && (
          <div className={styles.center}>
            <Metric m={primary} size="md" stacked showLabel={primary.id === 'pause'} />
          </div>
        )}
      </div>
      {live.length > 0 && (
        <div className={styles.legend}>
          {live.map((m) => (
            <Metric key={m.id} m={m} size="sm" dot showLabel={false} />
          ))}
        </div>
      )}
    </div>
  );
}
