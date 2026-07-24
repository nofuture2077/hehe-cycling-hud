import { IconRoute, IconPin, IconElevationUp, IconElevationDown, IconFlag } from './icons/Icons';
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
  remainingDistanceKm = null,
  remainingElevationGainM = null,
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
  remainingDistanceKm?: number | null;
  remainingElevationGainM?: number | null;
}) {
  return (
    <div className={styles.statsCard}>
      {showDistance && (
        <div className={`${styles.chip} ${styles.distance} ${styles.statsDistance}`}>
          <div className={styles.statsDistanceItem}>
            <span className={styles.chipIcon}>
              <IconRoute />
            </span>
            <span className={styles.value}>
              <NumberValue n={split ? splitDistanceKm : distanceKm} digits={1} />
              <span className={styles.unit}>km</span>
            </span>
          </div>
          {split && (
            <div className={styles.statsDistanceItem}>
              <span className={styles.chipIcon}>
                <IconPin />
              </span>
              <span className={styles.value}>
                <NumberValue n={distanceKm} digits={1} />
                <span className={styles.unit}>km</span>
              </span>
            </div>
          )}
          {remainingDistanceKm != null && (
            <div className={styles.statsDistanceItem}>
              <span className={styles.chipIcon}>
                <IconFlag />
              </span>
              <span className={styles.value}>
                <NumberValue n={remainingDistanceKm} digits={1} />
                <span className={styles.unit}>km</span>
              </span>
            </div>
          )}
        </div>
      )}
      {showElevation && (
        <div className={`${styles.chip} ${styles.statsElevation}`}>
          <div className={`${styles.statsElevationRow} ${styles.gain}`}>
            <span className={styles.chipIcon}>
              <IconElevationUp />
            </span>
            <span className={styles.value}>
              {fmt(Math.max(0, split ? splitElevationGainM : elevationGainM))}
              <span className={styles.unit}>m</span>
            </span>
          </div>
          <div className={`${styles.statsElevationRow} ${styles.loss}`}>
            <span className={styles.chipIcon}>
              <IconElevationDown />
            </span>
            <span className={styles.value}>
              {fmt(Math.max(0, split ? splitElevationLossM : elevationLossM))}
              <span className={styles.unit}>m</span>
            </span>
          </div>
          {remainingElevationGainM != null && (
            <div className={`${styles.statsElevationRow} ${styles.remaining}`}>
              <span className={styles.chipIcon}>
                <IconFlag />
              </span>
              <span className={styles.value}>
                {fmt(Math.max(0, remainingElevationGainM))}
                <span className={styles.unit}>m</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
