import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
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

// the original/built-in arrangement: a top-left cluster (logo, location, distance/elevation
// stats, optional track map) and a bottom-right cluster (elevation profile above a row of
// circular gauges). This is the "layout" half of the split - purely which widget goes where;
// all the show/hide and value logic lives in the widgets and in core.
export default function DefaultLayout({ ctx }: { ctx: HudContext }) {
  const { visibility } = ctx;

  return (
    <>
      {visibility.showTopChips && (
        <div className={`${styles.chipCluster} ${styles.topLeft} ${visibility.showElevation ? styles.matchWidth : ''}`}>
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
        <div className={`${styles.chipCluster} ${styles.bottomRight}`}>
          <ElevationProfile ctx={ctx} />
          <div className={styles.gaugeRow}>
            <HeartRateGauge ctx={ctx} />
            <PowerGauge ctx={ctx} />
            <GradientGauge ctx={ctx} />
            <PrimaryGauge ctx={ctx} />
          </div>
        </div>
      )}
    </>
  );
}
