import { useMemo } from 'react';
import type { GpxPoint } from '../core/gpx/parseGpx';
import { distanceMeters, findNearestPointIndex, CLOSE_THRESHOLD_METERS } from '../core/gpx/trackStats';
import styles from './ElevationProfile.module.css';

const VIEWBOX_WIDTH = 240;
const VIEWBOX_HEIGHT = 80;
const PADDING = 6;
// elevation range is clamped to at least this many meters before normalizing, so a nearly
// flat stage actually reads as flat - ranges above this (e.g. an alpine 3000m climb) still
// scale up dynamically to use the full height instead of clipping
const MIN_SPAN_METERS = 200;

export function ElevationProfile({
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

    // cumulative distance along the track gives the x-axis
    const cumulative: number[] = [0];
    for (let i = 1; i < points.length; i += 1) {
      cumulative.push(cumulative[i - 1] + distanceMeters(points[i - 1], points[i]));
    }

    const nearestIndex = position ? findNearestPointIndex(points, position.lat, position.lon) : -1;
    const nearestDistance = nearestIndex >= 0 && position
      ? distanceMeters(points[nearestIndex], position)
      : Infinity;

    // when a radius is given and we have a live position, only frame the elevation profile
    // around nearby points on the track - windowed by distance *along the route*, not
    // straight-line distance, so a switchback or hairpin loop that passes physically close
    // to the rider without having been ridden yet doesn't get pulled into the window and
    // skew the min/max with elevations the rider hasn't reached
    let visibleIndices = points.map((_, i) => i);
    if (radiusMeters != null && position && nearestIndex >= 0) {
      const centerDistance = cumulative[nearestIndex];
      const nearbyIndices = points
        .map((_, i) => i)
        .filter((i) => Math.abs(cumulative[i] - centerDistance) <= radiusMeters);
      if (nearbyIndices.length > 0) visibleIndices = nearbyIndices;
    }

    const startDistance = cumulative[visibleIndices[0]];
    const endDistance = cumulative[visibleIndices[visibleIndices.length - 1]];
    const totalDistance = endDistance - startDistance || 1;

    const visibleElevations = visibleIndices.map((i) => points[i].ele);
    const minEle = Math.min(...visibleElevations);
    const maxEle = Math.max(...visibleElevations);
    const spanEle = Math.max(maxEle - minEle, MIN_SPAN_METERS);
    // when the actual range is smaller than MIN_SPAN_METERS, center it within the clamped
    // span instead of anchoring to the bottom, so flat stretches sit mid-chart
    const baseEle = (minEle + maxEle) / 2 - spanEle / 2;

    const toSvg = (i: number) => ({
      x: PADDING + ((cumulative[i] - startDistance) / totalDistance) * (VIEWBOX_WIDTH - PADDING * 2),
      y: PADDING + (1 - (points[i].ele - baseEle) / spanEle) * (VIEWBOX_HEIGHT - PADDING * 2),
    });

    const svgPoints = visibleIndices.map((i) => toSvg(i));

    const marker = nearestIndex >= 0 && nearestDistance <= CLOSE_THRESHOLD_METERS && visibleIndices.includes(nearestIndex)
      ? toSvg(nearestIndex)
      : null;

    return { svgPoints, marker, minEle, maxEle };
  }, [points, position, radiusMeters]);

  if (!result) return null;

  const polylinePoints = result.svgPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <svg className={styles.profile} viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
          <polyline className={styles.line} points={polylinePoints} />
          {result.marker && <circle className={`${styles.marker} ${styles.markerBlink}`} cx={result.marker.x} cy={result.marker.y} r={5} />}
        </svg>
        <div className={styles.legend}>
          <span className={styles.legendValue}>{Math.round(result.maxEle)}m</span>
          <span className={styles.legendValue}>{Math.round(result.minEle)}m</span>
        </div>
      </div>
    </div>
  );
}
