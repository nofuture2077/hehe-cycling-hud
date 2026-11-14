import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import type { ClusterProps, LayoutWidgets } from './registry';
import styles from '../CyclingHud.module.css';

const Logo = getWidget('logo');
const LocationChip = getWidget('locationChip');
const StatsCard = getWidget('statsCard');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');
const HeartRateGauge = getWidget('heartRateGauge');
const PowerGauge = getWidget('powerGauge');
const GradientGauge = getWidget('gradientGauge');
const PrimaryGauge = getWidget('primaryGauge');

// logo, location, distance/elevation stats, optional track map
export function InfoCluster({ ctx, className }: ClusterProps) {
  const { visibility } = ctx;
  if (!visibility.showTopChips) return null;

  return (
    <div className={`${styles.chipCluster} ${className} ${visibility.showElevation ? styles.matchWidth : ''}`}>
      <div className={styles.hor}>
        <Logo ctx={ctx} />
        <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
          <LocationChip ctx={ctx} />
          <StatsCard ctx={ctx} />
        </div>
      </div>
      {visibility.showGpxMap && (
        <div className={styles.trackMapSpacing}>
          <TrackMap ctx={ctx} />
        </div>
      )}
    </div>
  );
}

// elevation profile next to a row of circular gauges
export function GaugeCluster({ ctx, className }: ClusterProps) {
  if (!ctx.visibility.showAnyGauge) return null;

  return (
    <div className={`${styles.chipCluster} ${styles.gaugeCluster} ${className}`}>
      <ElevationProfile ctx={ctx} />
      <div className={styles.gaugeRow}>
        <HeartRateGauge ctx={ctx} />
        <PowerGauge ctx={ctx} />
        <GradientGauge ctx={ctx} />
        <PrimaryGauge ctx={ctx} />
      </div>
    </div>
  );
}

// the original/built-in arrangement: a top-left cluster (logo, location, distance/elevation
// stats, optional track map) and a bottom-right cluster (elevation profile above a row of
// circular gauges). This is the "layout" half of the split - purely which widget goes where;
// all the show/hide and value logic lives in the widgets and in core.
export default function DefaultLayout({ ctx }: { ctx: HudContext }) {
  return (
    <>
      <InfoCluster ctx={ctx} className={styles.topLeft} />
      <GaugeCluster ctx={ctx} className={styles.bottomRight} />
    </>
  );
}

export const widgets: LayoutWidgets = {
  info: { width: 520, height: 150, Cluster: InfoCluster },
  gauges: { width: 760, height: 140, Cluster: GaugeCluster },
};
