import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
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

// CP2077-inspired arrangement: instead of the default/cockpit circular gauges, vitals render as
// the game's actual health/stamina-style segmented bars, stacked bottom-left like its vitals
// readout, with the elevation profile docked to the bottom-right. Combinable with any theme (the
// bars fall back to --hud-accent when a theme has no bucket-color tokens), but designed to pair
// with the cyberpunk2077 theme.
export default function NetrunnerLayout({ ctx }: { ctx: HudContext }) {
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
        <div className={styles.bottomLeft}>
          <div className={styles.barStack}>
            <SpeedBar ctx={ctx} />
            <HeartRateBar ctx={ctx} />
            <PowerBar ctx={ctx} />
            <GradientBar ctx={ctx} />
          </div>
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
