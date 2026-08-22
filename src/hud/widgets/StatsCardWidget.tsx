import { StatsCard } from '../StatsCard';
import type { HudContext } from '../context';

export function StatsCardWidget({ ctx }: { ctx: HudContext }) {
  const { visible } = ctx.config;
  const { visibility, gpx, data } = ctx;
  if (!visible.distance && !visibility.showElevation) return null;
  return (
    <StatsCard
      showDistance={visible.distance}
      showElevation={visibility.showElevation}
      split={visible.split}
      distanceKm={data.distanceKm}
      splitDistanceKm={data.splitDistanceKm}
      elevationGainM={data.elevationGainM}
      elevationLossM={data.elevationLossM}
      splitElevationGainM={data.splitElevationGainM}
      splitElevationLossM={data.splitElevationLossM}
      remainingDistanceKm={visibility.showGpxRemainingDistance ? gpx.remainingDistanceKm : null}
      remainingElevationGainM={visibility.showGpxRemainingElevation ? gpx.remainingElevationGainM : null}
    />
  );
}
