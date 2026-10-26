import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import { StatsLine } from '../minimal/InlineStats';
import styles from './float.module.css';

const Logo = getWidget('logo');
const MinimalLocation = getWidget('minimalLocation');
const HeroSpeed = getWidget('heroSpeed');
const MetricDots = getWidget('metricDots');
const RouteProgress = getWidget('routeProgress');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');

// no panels at all: plain text top-left, one oversized speed numeral bottom-left with the vitals
// as colored dots underneath, and the route as a single progress line along the bottom edge
// (only when remaining distance is enabled - otherwise the bottom clusters sit on the edge).
// Designed for the vivid theme, but every color has a fallback so it works under any theme.
export default function FloatLayout({ ctx }: { ctx: HudContext }) {
  const { visibility, gpx } = ctx;
  // same condition RouteProgressWidget renders under - without the route line, the bottom
  // clusters drop down to the edge instead of leaving an empty band
  const showRoute = visibility.showGpxRemainingDistance && (gpx.nearestIndex >= 0 || gpx.goalDistanceKm > 0);
  const bottomClass = showRoute ? '' : styles.atEdge;

  return (
    <>
      {(visibility.showTopChips || visibility.showLogo) && (
        <div className={styles.topLeft}>
          <Logo ctx={ctx} />
          <div>
            <MinimalLocation ctx={ctx} />
            <StatsLine ctx={ctx} skipRemainingDistance={showRoute} />
          </div>
        </div>
      )}

      <div className={`${styles.bottomLeft} ${bottomClass}`}>
        <HeroSpeed ctx={ctx} />
        <MetricDots ctx={ctx} />
      </div>

      {(visibility.showGpxMap || visibility.showGpxElevationMap) && (
        <div className={`${styles.bottomRight} ${bottomClass}`}>
          <TrackMap ctx={ctx} />
          <ElevationProfile ctx={ctx} />
        </div>
      )}

      {showRoute && (
        <div className={styles.bottomEdge}>
          <RouteProgress ctx={ctx} />
        </div>
      )}
    </>
  );
}
