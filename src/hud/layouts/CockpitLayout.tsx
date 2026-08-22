import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
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

// telemetry-strip arrangement: both clusters sit side by side on one bottom-center line, and the
// gauge row leads with speed/pause instead of the default layout's heart-rate-first order. Same
// widgets as the default layout, just placed differently - see cockpit.module.css for the
// positioning and src/hud/themes/cockpit.css for the (independent) color palette.
export default function CockpitLayout({ ctx }: { ctx: HudContext }) {
  const { visibility } = ctx;

  return (
    <>
      {visibility.showTopChips && (
        <div className={`${styles.topLeft} ${visibility.showElevation ? styles.matchWidth : ''}`}>
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
      )}

      {visibility.showAnyGauge && (
        <div className={styles.bottomRight}>
          <ElevationProfile ctx={ctx} />
          <div className={sharedStyles.gaugeRow}>
            <PrimaryGauge ctx={ctx} />
            <HeartRateGauge ctx={ctx} />
            <PowerGauge ctx={ctx} />
            <GradientGauge ctx={ctx} />
          </div>
        </div>
      )}
    </>
  );
}
