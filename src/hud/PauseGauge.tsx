import { IconClock, IconPause } from './icons/Icons';
import { currentPauseParts, durationParts } from './format';
import { NumberValue } from './NumberValue';
import styles from './Gauge.module.css';

export function PauseGauge({
  currentSeconds,
  totalSeconds,
  breakCount,
}: {
  currentSeconds: number;
  totalSeconds: number;
  breakCount: number;
}) {
  const current = currentPauseParts(currentSeconds);
  const total = durationParts(totalSeconds);

  return (
    <div className={`${styles.gauge} ${styles.gaugeBig} ${styles.pause}`}>
      <span className={styles.pauseBadge}>{breakCount}</span>
      <div className={styles.gaugeMain}>
        <span className={styles.pauseIcon}>
          <IconPause />
        </span>
        <span className={`${styles.gaugeValue} ${styles.pauseValue}`}>
          <NumberValue n={current.value} decimal={current.decimal} separator=":" />
        </span>
        <span className={styles.gaugeSecondary}>
          <IconClock />
          <NumberValue n={total.value} decimal={total.decimal} />
          {total.unit}
        </span>
      </div>
    </div>
  );
}
