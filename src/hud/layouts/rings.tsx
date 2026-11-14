import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import type { ClusterProps, LayoutWidgets } from './registry';
import styles from './rings.module.css';

const Logo = getWidget('logo');
const MinimalLocation = getWidget('minimalLocation');
const MinimalStats = getWidget('minimalStats');
const MetricRings = getWidget('metricRings');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');

function InfoCluster({ ctx, className }: ClusterProps) {
  const { visibility } = ctx;
  if (!visibility.showTopChips && !visibility.showLogo) return null;

  return (
    <div className={`${styles.info} ${className}`}>
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
  );
}

function GaugeCluster({ ctx, className }: ClusterProps) {
  return (
    <div className={`${styles.gauges} ${className}`}>
      <ElevationProfile ctx={ctx} />
      <MetricRings ctx={ctx} />
    </div>
  );
}

// activity-ring arrangement: heart rate / power / gradient as concentric arcs bottom-right with
// speed in the middle, the elevation profile beside them, and plain text top-left
export default function RingsLayout({ ctx }: { ctx: HudContext }) {
  return (
    <>
      <InfoCluster ctx={ctx} className={styles.topLeft} />
      <GaugeCluster ctx={ctx} className={styles.bottomRight} />
    </>
  );
}

export const widgets: LayoutWidgets = {
  info: { width: 870, height: 140, Cluster: InfoCluster },
  gauges: { width: 580, height: 310, Cluster: GaugeCluster },
};
