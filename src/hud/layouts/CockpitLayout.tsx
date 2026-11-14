import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import type { ClusterProps, LayoutWidgets } from './registry';
import sharedStyles from '../CyclingHud.module.css';
import styles from './cockpit.module.css';

const Logo = getWidget('logo');
const LocationChip = getWidget('locationChip');
const StatsCard = getWidget('statsCard');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');
const HeartRateGauge = getWidget('heartRateGauge');
const PowerGauge = getWidget('powerGauge');
const GradientGauge = getWidget('gradientGauge');
const PrimaryGauge = getWidget('primaryGauge');

function InfoCluster({ ctx, className }: ClusterProps) {
  const { visibility } = ctx;
  if (!visibility.showTopChips) return null;

  return (
    <div className={`${styles.info} ${visibility.showElevation ? styles.matchWidth : ''} ${className}`}>
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

function GaugeCluster({ ctx, className }: ClusterProps) {
  if (!ctx.visibility.showAnyGauge) return null;

  return (
    <div className={`${styles.gauges} ${className}`}>
      <ElevationProfile ctx={ctx} />
      <div className={sharedStyles.gaugeRow}>
        <PrimaryGauge ctx={ctx} />
        <HeartRateGauge ctx={ctx} />
        <PowerGauge ctx={ctx} />
        <GradientGauge ctx={ctx} />
      </div>
    </div>
  );
}

// telemetry-strip arrangement: both clusters sit side by side on one bottom-center line, and the
// gauge row leads with speed/pause instead of the default layout's heart-rate-first order. Same
// widgets as the default layout, just placed differently - see cockpit.module.css for the
// positioning and src/hud/themes/cockpit.css for the (independent) color palette.
export default function CockpitLayout({ ctx }: { ctx: HudContext }) {
  return (
    <>
      <InfoCluster ctx={ctx} className={styles.left} />
      <GaugeCluster ctx={ctx} className={styles.right} />
    </>
  );
}

export const widgets: LayoutWidgets = {
  info: { width: 520, height: 150, Cluster: InfoCluster },
  gauges: { width: 770, height: 140, Cluster: GaugeCluster },
};
