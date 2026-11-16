import { useMemo, useRef } from 'react';
import { cumulativeDistances, findNearestPointIndex } from '../../core/gpx/trackStats';
import type { GpxProgress } from '../../core/useGpxProgress';

export interface RouteProgressInfo {
  percent: number;
  doneKm: number;
  totalKm: number;
  remainingKm: number;
  // waypoint positions along the route, 0-100
  markers: number[];
}

// how far along the active GPX track (or the manual distance goal) the rider is - null when there's neither. Without a
// live fix on the track (not there yet, a detour, no GPS) it stays where the rider was last matched, at the start
// before that
export function useRouteProgress(gpx: GpxProgress): RouteProgressInfo | null {
  const { points, waypoints } = gpx;
  const lastIndex = useRef<{ points: GpxProgress['points']; index: number } | null>(null);
  if (gpx.nearestIndex >= 0) lastIndex.current = { points, index: gpx.nearestIndex };

  const cumulative = useMemo(() => cumulativeDistances(points), [points]);

  const totalM = cumulative[cumulative.length - 1] ?? 0;

  const markers = useMemo(
    () => (totalM > 0
      ? waypoints.map((w) => (cumulative[findNearestPointIndex(points, w.lat, w.lon)] / totalM) * 100)
      : []),
    [waypoints, points, cumulative, totalM],
  );

  if (gpx.goalDistanceKm > 0) {
    const totalKm = gpx.goalDistanceKm;
    const doneKm = Math.max(0, totalKm - gpx.remainingDistanceKm);
    return { percent: (doneKm / totalKm) * 100, doneKm, totalKm, remainingKm: gpx.remainingDistanceKm, markers: [] };
  }
  if (totalM <= 0) return null;
  const index = lastIndex.current?.points === points ? lastIndex.current.index : 0;
  const doneM = cumulative[index];
  return {
    percent: (doneM / totalM) * 100,
    doneKm: doneM / 1000,
    totalKm: totalM / 1000,
    remainingKm: (totalM - doneM) / 1000,
    markers,
  };
}
