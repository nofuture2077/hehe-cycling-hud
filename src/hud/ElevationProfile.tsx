import { useId, useMemo } from 'react';
import type { GpxPoint } from '../core/gpx/parseGpx';
import { cumulativeDistances, distanceMeters, findNearestPointIndex, CLOSE_THRESHOLD_METERS } from '../core/gpx/trackStats';
import type { TrackStyle } from '../core/types';
import { defaultTrackStyle } from '../core/types';
import { trackLookStyle } from './trackLook';
import styles from './ElevationProfile.module.css';

// px, drawn 1:1: the chart fills the box, the heights sit inside its left edge. As wide as the track map (TrackMap)
const WIDTH = 240;
const HEIGHT = 112;
const PADDING = 8;
const GRID_ROWS = 4;
const GRID_COLUMNS = 6;
// the elevation range is clamped to at least look.elevationMinSpanM (200 m unless set) before normalizing, so a nearly
// flat stage actually reads as flat - ranges above it (e.g. an alpine 3000m climb) still scale up dynamically to use
// the full height instead of clipping

export function ElevationProfile({
  points,
  position = null,
  radiusMeters = null,
  nearestIndex: matchedIndex,
  look = defaultTrackStyle,
}: {
  points: GpxPoint[];
  position?: { lat: number; lon: number } | null;
  radiusMeters?: number | null;
  // progress-aware track index from useGpxProgress - falls back to a plain nearest-point search
  nearestIndex?: number;
  look?: TrackStyle;
}) {
  const { elevationFromZero, elevationMinSpanM } = look;
  const result = useMemo(() => {
    if (points.length === 0) return null;

    // cumulative distance along the track gives the x-axis
    const cumulative = cumulativeDistances(points);

    const nearestIndex = !position ? -1 : matchedIndex ?? findNearestPointIndex(points, position.lat, position.lon);
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
    // from 0 m (or below, for a track under sea level) the axis starts there and spans up to the highest point;
    // otherwise a range smaller than the minimum span is centered within it instead of anchored to the bottom, so
    // flat stretches sit mid-chart
    const bottomEle = elevationFromZero ? Math.min(0, minEle) : minEle;
    const spanEle = Math.max(maxEle - bottomEle, elevationMinSpanM);
    const baseEle = elevationFromZero ? bottomEle : (minEle + maxEle) / 2 - spanEle / 2;

    const toSvg = (i: number) => ({
      x: PADDING + ((cumulative[i] - startDistance) / totalDistance) * (WIDTH - PADDING * 2),
      y: PADDING + (1 - (points[i].ele - baseEle) / spanEle) * (HEIGHT - PADDING * 2),
    });

    const svgPoints = visibleIndices.map((i) => toSvg(i));

    const marker = nearestIndex >= 0 && nearestDistance <= CLOSE_THRESHOLD_METERS && visibleIndices.includes(nearestIndex)
      ? toSvg(nearestIndex)
      : null;

    return { svgPoints, marker, minEle: bottomEle, maxEle };
  }, [points, position, radiusMeters, matchedIndex, elevationFromZero, elevationMinSpanM]);

  const gradientId = useId();
  if (!result) return null;

  const line = result.svgPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const first = result.svgPoints[0];
  const last = result.svgPoints[result.svgPoints.length - 1];
  const bottom = HEIGHT - PADDING;
  const area = `M ${first.x.toFixed(2)},${bottom} L ${line.replaceAll(' ', ' L ')} L ${last.x.toFixed(2)},${bottom} Z`;
  const chartWidth = WIDTH - PADDING * 2;
  const chartHeight = HEIGHT - PADDING * 2;

  return (
    <div className={styles.container} style={trackLookStyle(look)}>
      <svg className={styles.profile} width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className={styles.areaTop} />
            <stop offset="1" className={styles.areaBottom} />
          </linearGradient>
        </defs>
        <g className={styles.grid}>
          {Array.from({ length: GRID_ROWS + 1 }, (_, i) => {
            const y = PADDING + (chartHeight * i) / GRID_ROWS;
            return <line key={`r${i}`} x1={PADDING} x2={WIDTH - PADDING} y1={y} y2={y} />;
          })}
          {Array.from({ length: GRID_COLUMNS + 1 }, (_, i) => {
            const x = PADDING + (chartWidth * i) / GRID_COLUMNS;
            return <line key={`c${i}`} x1={x} x2={x} y1={PADDING} y2={bottom} />;
          })}
        </g>
        <path d={area} fill={`url(#${gradientId})`} />
        <polyline className={styles.line} points={line} />
        {result.marker && <circle className={`${styles.marker} ${styles.markerBlink}`} cx={result.marker.x} cy={result.marker.y} r={5} />}
        <text className={styles.legendValue} x={PADDING + 4} y={PADDING + 12}>{Math.round(result.maxEle)} m</text>
        <text className={styles.legendValue} x={PADDING + 4} y={bottom - 4}>{Math.round(result.minEle)} m</text>
      </svg>
    </div>
  );
}
