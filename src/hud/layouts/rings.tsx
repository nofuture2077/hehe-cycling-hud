import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import styles from './rings.module.css';

const Logo = getWidget('logo');
const MinimalLocation = getWidget('minimalLocation');
const MinimalStats = getWidget('minimalStats');
const MetricRings = getWidget('metricRings');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');

// activity-ring arrangement: heart rate / power / gradient as concentric arcs bottom-right with
// speed in the middle, the elevation profile beside them, and plain text top-left
export default function RingsLayout({ ctx }: { ctx: HudContext }) {
  const { visibility } = ctx;

  return (
    <>
      {(visibility.showTopChips || visibility.showLogo) && (
        <div className={styles.topLeft}>
          <div className={styles.hor}>
            <Logo ctx={ctx} />
            <div>
              <MinimalLocation ctx={ctx} />
              <MinimalStats ctx={ctx} />
            </div>
          </div>
          {visibility.showGpxMap && (
            <div className={styles.map}>
              <TrackMap ctx={ctx} />
            </div>
          )}
        </div>
      )}

      <div className={styles.bottomRight}>
        <ElevationProfile ctx={ctx} />
        <MetricRings ctx={ctx} />
      </div>
    </>
  );
}
