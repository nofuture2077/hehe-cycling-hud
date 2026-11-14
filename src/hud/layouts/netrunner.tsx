import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import type { ClusterProps, LayoutWidgets } from './registry';
import styles from './netrunner.module.css';

const Logo = getWidget('logo');
const LocationChip = getWidget('locationChip');
const StatsCard = getWidget('statsCard');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');
const SpeedBar = getWidget('speedBar');
const HeartRateBar = getWidget('heartRateBar');
const PowerBar = getWidget('powerBar');
const GradientBar = getWidget('gradientBar');

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

function Bars({ ctx }: { ctx: HudContext }) {
  return (
    <div className={styles.barStack}>
      <SpeedBar ctx={ctx} />
      <HeartRateBar ctx={ctx} />
      <PowerBar ctx={ctx} />
      <GradientBar ctx={ctx} />
    </div>
  );
}

// a single widget (layouts/widget.tsx) has the bars and the elevation profile side by side, as they
// are in the bottom corners of the full layout
function GaugeCluster({ ctx, className }: ClusterProps) {
  const { visibility } = ctx;
  if (!visibility.showAnyGauge && !visibility.showElevation) return null;

  return (
    <div className={`${styles.gauges} ${className}`}>
      {visibility.showAnyGauge && <Bars ctx={ctx} />}
      {visibility.showElevation && <ElevationProfile ctx={ctx} />}
    </div>
  );
}

// CP2077-inspired arrangement: instead of the default/cockpit circular gauges, vitals render as
// the game's actual health/stamina-style segmented bars, stacked bottom-left like its vitals
// readout, with the elevation profile docked to the bottom-right. Combinable with any theme (the
// bars fall back to --hud-accent when a theme has no bucket-color tokens), but designed to pair
// with the cyberpunk2077 theme.
export default function NetrunnerLayout({ ctx }: { ctx: HudContext }) {
  const { visibility } = ctx;

  return (
    <>
      <InfoCluster ctx={ctx} className={styles.topLeft} />

      {visibility.showAnyGauge && (
        <div className={styles.bottomLeft}>
          <Bars ctx={ctx} />
        </div>
      )}
      {visibility.showElevation && (
        <div className={styles.bottomRight}>
          <ElevationProfile ctx={ctx} />
        </div>
      )}
    </>
  );
}

export const widgets: LayoutWidgets = {
  info: { width: 520, height: 150, Cluster: InfoCluster },
  gauges: { width: 500, height: 230, Cluster: GaugeCluster },
};
