import { useMemo, useRef } from 'react';
import { parseGpx, parseGpxWaypoints, type GpxPoint, type GpxWaypoint } from './gpx/parseGpx';
import { cumulativeDistances, matchTrackIndex, remainingDistanceMeters, remainingElevationGainMeters } from './gpx/trackStats';
import type { CyclingData, CyclingHudConfig, GpxTrack } from './types';

export interface GpxProgress {
  points: GpxPoint[];
  waypoints: GpxWaypoint[];
  position: { lat: number; lon: number } | null;
  nearestIndex: number;
  remainingDistanceKm: number;
  remainingElevationGainM: number;
  // manual goals from config, only non-zero while no GPX track is loaded (the track always wins)
  goalDistanceKm: number;
  goalElevationM: number;
}

// last matched track index plus the odometer reading at that moment - lets the next match
// predict where along the route the rider should be now
interface LastMatch {
  points: GpxPoint[];
  index: number;
  odometerKm: number;
}

// derives the rider's live progress along an active GPX track from raw telemetry - shared by any
// layout that wants to render a track map, elevation profile, or "distance/elevation remaining"
export function useGpxProgress(
  gpxTrack: GpxTrack | null,
  data: CyclingData,
  config: Pick<CyclingHudConfig, 'goalDistanceKm' | 'goalElevationM' | 'visible'>,
): GpxProgress {
  const points = useMemo(() => (gpxTrack ? parseGpx(gpxTrack.content) : []), [gpxTrack]);
  const waypoints = useMemo(() => (gpxTrack ? parseGpxWaypoints(gpxTrack.content) : []), [gpxTrack]);
  const cumulative = useMemo(() => cumulativeDistances(points), [points]);
  const lastMatch = useRef<LastMatch | null>(null);

  const position = data.latitude != null && data.longitude != null
    ? { lat: data.latitude, lon: data.longitude }
    : null;

  let nearestIndex = -1;
  if (position && points.length) {
    const last = lastMatch.current?.points === points ? lastMatch.current : null;
    // advance the last match by the distance ridden since - only the odometer *change* is used so
    // an odometer that didn't start at 0 (e.g. riding to the start) doesn't matter. with no last
    // match (first fix, page reload) the raw odometer is the best guess - ~0 at the start of a ride
    const expectedDistanceM = last
      ? cumulative[last.index] + (data.distanceKm - last.odometerKm) * 1000
      : data.distanceKm * 1000;
    nearestIndex = matchTrackIndex(points, cumulative, position, expectedDistanceM);
    lastMatch.current = { points, index: nearestIndex, odometerKm: data.distanceKm };
  }

  // no track: fall back to the manual goals, measured against whichever counter the HUD displays
  const goalDistanceKm = points.length ? 0 : config.goalDistanceKm;
  const goalElevationM = points.length ? 0 : config.goalElevationM;
  const riddenKm = config.visible.split ? data.splitDistanceKm : data.distanceKm;
  const climbedM = config.visible.split ? data.splitElevationGainM : data.elevationGainM;

  let remainingDistanceKm = nearestIndex >= 0 ? remainingDistanceMeters(points, nearestIndex) / 1000 : 0;
  let remainingElevationGainM = nearestIndex >= 0 ? remainingElevationGainMeters(points, nearestIndex) : 0;
  if (goalDistanceKm > 0) remainingDistanceKm = Math.max(0, goalDistanceKm - riddenKm);
  if (goalElevationM > 0) remainingElevationGainM = Math.max(0, goalElevationM - climbedM);

  return {
    points, waypoints, position, nearestIndex, remainingDistanceKm, remainingElevationGainM,
    goalDistanceKm, goalElevationM,
  };
}
