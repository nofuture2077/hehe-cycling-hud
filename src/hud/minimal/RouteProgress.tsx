import { fmt } from '../format';
import { ProgressLine } from './ProgressLine';
import type { RouteProgressInfo } from './route';
import styles from './RouteProgress.module.css';

// full-width "how far along the route" line: gradient fill up to the rider, waypoint dots, done
// and remaining km at either end
export function RouteProgress({ route }: { route: RouteProgressInfo }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.end}>
        {fmt(route.doneKm, 1)}
        <span className={styles.unit}>km</span>
      </span>
      <div className={styles.line}>
        <ProgressLine
          percent={route.percent}
          color="var(--hud-route-gradient, linear-gradient(90deg, #38bdf8, #a78bfa, #ff5d73))"
          thickness={4}
          markers={route.markers}
          head
        />
      </div>
      <span className={styles.end}>
        {fmt(route.remainingKm, 1)}
        <span className={styles.unit}>km to go</span>
      </span>
    </div>
  );
}
