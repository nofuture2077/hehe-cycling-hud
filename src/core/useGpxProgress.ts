import { useMemo } from 'react';
import { parseGpx, parseGpxWaypoints, type GpxPoint, type GpxWaypoint } from './gpx/parseGpx';
import { findNearestPointIndex, remainingDistanceMeters, remainingElevationGainMeters } from './gpx/trackStats';
import type { CyclingData, GpxTrack } from './types';

export interface GpxProgress {
  points: GpxPoint[];
  waypoints: GpxWaypoint[];
  position: { lat: number; lon: number } | null;
  nearestIndex: number;
  remainingDistanceKm: number;
  remainingElevationGainM: number;
}

// derives the rider's live progress along an active GPX track from raw telemetry - shared by any
// layout that wants to render a track map, elevation profile, or "distance/elevation remaining"
export function useGpxProgress(gpxTrack: GpxTrack | null, data: CyclingData): GpxProgress {
  const points = useMemo(() => (gpxTrack ? parseGpx(gpxTrack.content) : []), [gpxTrack]);
  const waypoints = useMemo(() => (gpxTrack ? parseGpxWaypoints(gpxTrack.content) : []), [gpxTrack]);

  const position = data.latitude != null && data.longitude != null
    ? { lat: data.latitude, lon: data.longitude }
    : null;
  const nearestIndex = position && points.length ? findNearestPointIndex(points, position.lat, position.lon) : -1;
  const remainingDistanceKm = nearestIndex >= 0 ? remainingDistanceMeters(points, nearestIndex) / 1000 : 0;
  const remainingElevationGainM = nearestIndex >= 0 ? remainingElevationGainMeters(points, nearestIndex) : 0;

  return { points, waypoints, position, nearestIndex, remainingDistanceKm, remainingElevationGainM };
}
