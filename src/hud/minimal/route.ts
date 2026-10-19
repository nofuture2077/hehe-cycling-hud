import { useMemo } from 'react';
import { distanceMeters, findNearestPointIndex } from '../../core/gpx/trackStats';
import type { GpxProgress } from '../../core/useGpxProgress';

export interface RouteProgressInfo {
  percent: number;
  doneKm: number;
  totalKm: number;
  remainingKm: number;
  // waypoint positions along the route, 0-100
  markers: number[];
}

// how far along the active GPX track the rider is - null when there's no track or no live fix
export function useRouteProgress(gpx: GpxProgress): RouteProgressInfo | null {
  const { points, waypoints } = gpx;

  const cumulative = useMemo(() => {
    const acc: number[] = [0];
    for (let i = 1; i < points.length; i += 1) acc.push(acc[i - 1] + distanceMeters(points[i - 1], points[i]));
    return acc;
  }, [points]);

  const totalM = cumulative[cumulative.length - 1] ?? 0;

  const markers = useMemo(
    () => (totalM > 0
      ? waypoints.map((w) => (cumulative[findNearestPointIndex(points, w.lat, w.lon)] / totalM) * 100)
      : []),
    [waypoints, points, cumulative, totalM],
  );

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
