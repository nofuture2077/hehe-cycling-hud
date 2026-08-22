import { TrackMap } from '../TrackMap';
import type { HudContext } from '../context';

export function TrackMapWidget({ ctx }: { ctx: HudContext }) {
  const { visibility, gpx, config } = ctx;
  if (!visibility.showGpxMap) return null;
  const position = config.visible.showGpxPosition ? gpx.position : null;
  return (
    <TrackMap
      points={gpx.points}
      position={position}
      radiusMeters={config.gpxMapRadius}
      waypoints={visibility.showGpxWaypoints ? gpx.waypoints : []}
    />
  );
}
