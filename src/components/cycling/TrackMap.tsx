import { useMemo } from 'react';
import type { GpxPoint } from '../../gpx/parseGpx';
import { distanceMeters, findNearestPointIndex, CLOSE_THRESHOLD_METERS } from '../../gpx/trackStats';
import styles from './TrackMap.module.css';

const VIEWBOX_SIZE = 200;
const PADDING = 12;

// equirectangular projection to a local flat plane - good enough at ride scale, and structured
// so a real map component (e.g. a tile-based lib) could swap in later without touching callers
function project(points: GpxPoint[], avgLatRad: number) {
  return points.map((p) => ({
    x: p.lon * Math.cos(avgLatRad),
    y: -p.lat,
  }));
}

function boundsOf(projected: { x: number; y: number }[]) {
  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
  };
}

export function TrackMap({
  points,
  position = null,
  radiusMeters = null,
}: {
  points: GpxPoint[];
  position?: { lat: number; lon: number } | null;
  radiusMeters?: number | null;
}) {
  const result = useMemo(() => {
    if (points.length === 0) return null;

    const avgLatRad = (points.reduce((sum, p) => sum + p.lat, 0) / points.length) * (Math.PI / 180);
    const projected = project(points, avgLatRad);

    const nearestIndex = position ? findNearestPointIndex(points, position.lat, position.lon) : -1;
    const nearestDistance = nearestIndex >= 0 && position
      ? distanceMeters(points[nearestIndex], position)
      : Infinity;
    const showMarker = nearestIndex >= 0 && nearestDistance <= CLOSE_THRESHOLD_METERS;

    // when a radius is given and we have a live position, only frame the bounding box around
    // nearby points - otherwise frame the whole track
    let visibleProjected = projected;
    if (radiusMeters != null && position) {
      const nearbyIndices = points
        .map((p, i) => ({ i, d: distanceMeters(p, position) }))
        .filter(({ d }) => d <= radiusMeters)
        .map(({ i }) => i);
      if (nearbyIndices.length > 0) visibleProjected = nearbyIndices.map((i) => projected[i]);
    }

    const bounds = boundsOf(visibleProjected);
    const spanX = bounds.maxX - bounds.minX || 1;
    const spanY = bounds.maxY - bounds.minY || 1;
    const scale = (VIEWBOX_SIZE - PADDING * 2) / Math.max(spanX, spanY);

    const toSvg = (p: { x: number; y: number }) => ({
      x: PADDING + (p.x - bounds.minX) * scale + (VIEWBOX_SIZE - PADDING * 2 - spanX * scale) / 2,
      y: PADDING + (p.y - bounds.minY) * scale + (VIEWBOX_SIZE - PADDING * 2 - spanY * scale) / 2,
    });

    const svgPoints = projected.map(toSvg);
    const marker = showMarker ? toSvg(projected[nearestIndex]) : null;

    return { svgPoints, marker };
  }, [points, position, radiusMeters]);

  if (!result) return null;

  const polylinePoints = result.svgPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  return (
    <div className={styles.wrapper}>
      <svg className={styles.map} viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
        <polyline className={styles.track} points={polylinePoints} />
        {result.marker && <circle className={`${styles.marker} ${styles.markerBlink}`} cx={result.marker.x} cy={result.marker.y} r={7} />}
      </svg>
    </div>
  );
}
