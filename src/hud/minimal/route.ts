import { useMemo } from 'react';
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

// how far along the active GPX track (or the manual distance goal) the rider is - null when there's
// neither, or a track but no live fix
export function useRouteProgress(gpx: GpxProgress): RouteProgressInfo | null {
  const { points, waypoints } = gpx;

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
  if (totalM <= 0 || gpx.nearestIndex < 0) return null;
  const doneM = cumulative[gpx.nearestIndex];
  return {
    percent: (doneM / totalM) * 100,
    doneKm: doneM / 1000,
    totalKm: totalM / 1000,
    remainingKm: gpx.remainingDistanceKm,
    markers,
  };
}
