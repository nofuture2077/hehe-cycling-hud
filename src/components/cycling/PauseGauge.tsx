import { IconPause } from './icons/Icons';
import { formatDuration } from './format';
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
  return (
    <div className={`${styles.gauge} ${styles.gaugeBig} ${styles.pause}`}>
      <span className={styles.pauseBadge}>{breakCount}</span>
      <div className={styles.gaugeMain}>
        <span className={styles.pauseIcon}>
          <IconPause />
        </span>
        <span className={`${styles.gaugeValue} ${styles.pauseValue}`}>{formatDuration(currentSeconds)}</span>
        <span className={styles.gaugeSecondary}>{`Σ ${formatDuration(totalSeconds)}`}</span>
      </div>
    </div>
  );
}
