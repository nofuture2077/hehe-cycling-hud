import { fmt } from '../format';
import { Metric } from '../minimal/Metric';
import { MetricRings } from '../minimal/MetricRings';
import { MetricRibbon, metricSegment, type RibbonSegment } from '../minimal/MetricRibbon';
import { ProgressLine } from '../minimal/ProgressLine';
import { RouteProgress } from '../minimal/RouteProgress';
import { LocationLine, StatsLine } from '../minimal/InlineStats';
import { METRIC_COLORS, primaryMetric, vitalMetrics } from '../minimal/metrics';
import { useRouteProgress } from '../minimal/route';
import type { HudContext } from '../context';

// widgets for the panel-less float/rings/ribbon layouts - deliberately share nothing visual with
// the chip/gauge widgets, only the data/visibility logic (via minimal/metrics.ts and core)

export function MinimalLocationWidget({ ctx }: { ctx: HudContext }) {
  return <LocationLine ctx={ctx} />;
}

export function MinimalStatsWidget({ ctx }: { ctx: HudContext }) {
  return <StatsLine ctx={ctx} />;
}

export function HeroSpeedWidget({ ctx }: { ctx: HudContext }) {
  const m = primaryMetric(ctx);
  if (!m.visible) return null;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 10, opacity: m.fading ? 0 : 1, transition: 'opacity 0.6s ease' }}>
      <Metric m={m} size="hero" showLabel={m.id === 'pause'} />
      <ProgressLine percent={m.percent} color={m.color} thickness={3} />
    </div>
  );
}

export function MetricDotsWidget({ ctx }: { ctx: HudContext }) {
  const live = vitalMetrics(ctx).filter((m) => m.visible);
  if (live.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 26 }}>
      {live.map((m) => (
        <Metric key={m.id} m={m} size="sm" dot showLabel={false} />
      ))}
    </div>
  );
}

export function MetricRingsWidget({ ctx }: { ctx: HudContext }) {
  const primary = primaryMetric(ctx);
  const vitals = vitalMetrics(ctx);
  if (!primary.visible && !vitals.some((m) => m.visible)) return null;
  return <MetricRings primary={primary} vitals={vitals} />;
}

export function MetricRibbonWidget({ ctx }: { ctx: HudContext }) {
  const { data, config, visibility, gpx } = ctx;
  const route = useRouteProgress(gpx);
  const primary = primaryMetric(ctx);

  const segments: RibbonSegment[] = [primary, ...vitalMetrics(ctx)].filter((m) => m.visible).map(metricSegment);
  if (config.visible.distance) {
    segments.push({
      key: 'distance',
      color: METRIC_COLORS.distance,
      percent: route ? route.percent : 100,
      value: fmt(config.visible.split ? data.splitDistanceKm : data.distanceKm, 1),
      unit: 'km',
      label: 'distance',
    });
  }
  if (visibility.showElevation) {
    const climbed = config.visible.split ? data.splitElevationGainM : data.elevationGainM;
    const total = climbed + gpx.remainingElevationGainM;
    segments.push({
      key: 'elevation',
      color: METRIC_COLORS.elev,
      percent: (route || gpx.goalElevationM > 0) && total > 0 ? (climbed / total) * 100 : 100,
      value: fmt(climbed),
      unit: 'm',
      label: 'climbed',
    });
  }
  return <MetricRibbon segments={segments} />;
}

export function RouteProgressWidget({ ctx }: { ctx: HudContext }) {
  const route = useRouteProgress(ctx.gpx);
  if (!route || !ctx.visibility.showGpxRemainingDistance) return null;
  return (
    <RouteProgress
      route={{ ...route, markers: ctx.visibility.showGpxWaypoints ? route.markers : [] }}
    />
  );
}
