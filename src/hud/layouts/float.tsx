import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import { LocationLine, StatsLine } from '../minimal/InlineStats';
import { WeatherAtmosphere } from '../WeatherAtmosphere';
import type { ClusterProps, LayoutWidgets } from './registry';
import styles from './float.module.css';

const Logo = getWidget('logo');
const HeroSpeed = getWidget('heroSpeed');
const MetricDots = getWidget('metricDots');
const RouteProgress = getWidget('routeProgress');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');

// same condition RouteProgressWidget renders under
function showRoute({ visibility, gpx }: HudContext) {
  return visibility.showGpxRemainingDistance && (gpx.points.length > 1 || gpx.goalDistanceKm > 0);
}

// route: the full layout shows the remaining distance on its route line, so the stats leave it out. A single widget
// (layouts/widget.tsx) shows it in the stats, the route line belongs to the gauges cluster.
function InfoCluster({ ctx, className, route = false }: ClusterProps & { route?: boolean }) {
  const { visibility, data, config } = ctx;
  if (!visibility.showTopChips && !visibility.showLogo) return null;

  return (
    <div className={`${styles.info} ${className}`}>
      <Logo ctx={ctx} />
      {/* the block's "Weather around the text" */}
      <WeatherAtmosphere
        condition={config.visible.locationWeatherAtmosphere ? data.weatherCondition : null}
        isDaylight={data.isDaylight}
      >
        <LocationLine ctx={ctx} />
        <StatsLine ctx={ctx} skipRemainingDistance={route} />
      </WeatherAtmosphere>
    </div>
  );
}

function Speed({ ctx }: { ctx: HudContext }) {
  return (
    <div className={styles.speed}>
      <HeroSpeed ctx={ctx} />
      <MetricDots ctx={ctx} />
    </div>
  );
}

function Maps({ ctx }: { ctx: HudContext }) {
  const { visibility } = ctx;
  if (!visibility.showGpxMap && !visibility.showGpxElevationMap) return null;

  return (
    <div className={styles.maps}>
      <TrackMap ctx={ctx} />
      <ElevationProfile ctx={ctx} />
    </div>
  );
}

// a single widget (layouts/widget.tsx) has speed and maps side by side above the route line, as they
// are along the bottom of the full layout. The cluster is as wide as its frame (stretch), so the route line runs
// across all of it.
function GaugeCluster({ ctx, className }: ClusterProps) {
  return (
    <div className={`${styles.gauges} ${className}`}>
      <div className={styles.gaugeRow}>
        <Speed ctx={ctx} />
        <Maps ctx={ctx} />
      </div>
      {showRoute(ctx) && <RouteProgress ctx={ctx} />}
    </div>
  );
}

// no panels at all: plain text top-left, one oversized speed numeral bottom-left with the vitals
// as colored dots underneath, and the route as a single progress line along the bottom edge
// (only when remaining distance is enabled - otherwise the bottom clusters sit on the edge).
// Designed for the vivid theme, but every color has a fallback so it works under any theme.
export default function FloatLayout({ ctx }: { ctx: HudContext }) {
  // without the route line, the bottom clusters drop down to the edge instead of leaving an empty band
  const route = showRoute(ctx);
  const bottomClass = route ? '' : styles.atEdge;

  return (
    <>
      <InfoCluster ctx={ctx} className={styles.topLeft} route={route} />

      <div className={`${styles.bottomLeft} ${bottomClass}`}>
        <Speed ctx={ctx} />
      </div>

      <div className={`${styles.bottomRight} ${bottomClass}`}>
        <Maps ctx={ctx} />
      </div>

      {route && (
        <div className={styles.bottomEdge}>
          <RouteProgress ctx={ctx} />
        </div>
      )}
    </>
  );
}

export const widgets: LayoutWidgets = {
  info: { width: 690, height: 140, Cluster: InfoCluster },
  gauges: { width: 600, height: 210, stretch: true, Cluster: GaugeCluster },
};
