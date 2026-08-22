import { ElevationProfile } from '../ElevationProfile';
import type { HudContext } from '../context';

export function ElevationProfileWidget({ ctx }: { ctx: HudContext }) {
  const { visibility, gpx, config } = ctx;
  if (!visibility.showGpxElevationMap) return null;
  const position = config.visible.showGpxElevationPosition ? gpx.position : null;
  return (
    <ElevationProfile points={gpx.points} position={position} radiusMeters={config.gpxMapRadius} />
  );
}
