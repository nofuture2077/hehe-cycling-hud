import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import type { ClusterProps, LayoutWidgets } from './registry';
import styles from './ribbon.module.css';

const Logo = getWidget('logo');
const MinimalLocation = getWidget('minimalLocation');
const MetricRibbon = getWidget('metricRibbon');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');

function Name({ ctx }: { ctx: HudContext }) {
  return (
    <div className={styles.name}>
      <Logo ctx={ctx} />
      <MinimalLocation ctx={ctx} />
    </div>
  );
}

// a single widget (layouts/widget.tsx) has the track map under the location, instead of in the
// other top corner as in the full layout
function InfoCluster({ ctx, className }: ClusterProps) {
  return (
    <div className={`${styles.info} ${className}`}>
      <Name ctx={ctx} />
      {ctx.visibility.showGpxMap && <TrackMap ctx={ctx} />}
    </div>
  );
}

function GaugeCluster({ ctx, className }: ClusterProps) {
  return (
    <div className={`${styles.gauges} ${className}`}>
      <ElevationProfile ctx={ctx} />
      <MetricRibbon ctx={ctx} />
    </div>
  );
}

// everything numeric lives in one frosted-glass strip centered along the bottom (distance and
// elevation included, so there's no separate stats block), the elevation profile floats just
// above it, and location is a single line of text top-left
export default function RibbonLayout({ ctx }: { ctx: HudContext }) {
  return (
    <>
      <div className={styles.topLeft}>
        <Name ctx={ctx} />
      </div>

      {ctx.visibility.showGpxMap && (
        <div className={styles.topRight}>
          <TrackMap ctx={ctx} />
        </div>
      )}

      <GaugeCluster ctx={ctx} className={styles.bottomCenter} />
    </>
  );
}

export const widgets: LayoutWidgets = {
  info: { width: 280, height: 140, Cluster: InfoCluster },
  gauges: { width: 1300, height: 260, Cluster: GaugeCluster },
};
