import { IconRoute, IconElevationUp, IconElevationDown } from './icons/Icons';
import { fmt } from './format';
import { NumberValue } from './NumberValue';
import styles from './Chips.module.css';

export function StatsCard({
  showDistance,
  showElevation,
  split,
  distanceKm,
  splitDistanceKm,
  elevationGainM,
  elevationLossM,
  splitElevationGainM,
  splitElevationLossM,
}: {
  showDistance: boolean;
  showElevation: boolean;
  split: boolean;
  distanceKm: number;
  splitDistanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  splitElevationGainM: number;
  splitElevationLossM: number;
}) {
  return (
    <div className={styles.statsCard}>
      {showDistance && (
        <div className={`${styles.chip} ${styles.distance} ${styles.statsDistance}`}>
          <span className={styles.chipIcon}>
            <IconRoute />
          </span>
          <span className={styles.chipValues}>
            <span className={styles.value}>
              <NumberValue n={split ? splitDistanceKm : distanceKm} digits={1} />
              <span className={styles.unit}>km</span>
            </span>
            {split && (
              <span className={styles.chipSecondary}>
                <NumberValue n={distanceKm} />
                <span className={styles.unit}>km</span>
              </span>
            )}
          </span>
        </div>
      )}
      {showDistance && showElevation && <div className={styles.statsDivider} />}
      {showElevation && (
        <div className={styles.statsElevation}>
          <div className={`${styles.statsElevationRow} ${styles.gain}`}>
            <span className={styles.chipIcon}>
              <IconElevationUp />
            </span>
            <span className={styles.value}>
              {fmt(split ? splitElevationGainM : elevationGainM)}
              <span className={styles.unit}>m</span>
            </span>
          </div>
          <div className={`${styles.statsElevationRow} ${styles.loss}`}>
            <span className={styles.chipIcon}>
              <IconElevationDown />
            </span>
            <span className={styles.value}>
              {fmt(split ? splitElevationLossM : elevationLossM)}
              <span className={styles.unit}>m</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
