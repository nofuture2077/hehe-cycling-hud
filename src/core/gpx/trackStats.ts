import type { GpxPoint } from './parseGpx';

export interface LatLon {
  lat: number;
  lon: number;
}

// distance (m) below which a live position is considered "on" the track - shared by TrackMap
// and ElevationProfile so both agree on when to draw the live-position marker. measured to the
// nearest track *point*, so it has to tolerate the gap between sparse GPX points on straights
export const CLOSE_THRESHOLD_METERS = 150;

// wider radius used to collect candidate track points when matching a live position - wider
// than the marker threshold so GPS noise and sparse points don't leave us with no candidates
export const MATCH_RADIUS_METERS = 300;

const EARTH_RADIUS_M = 6371000;

// haversine great-circle distance - track points span a whole ride so the flat-earth
// approximation used for the SVG projection isn't accurate enough here
export function distanceMeters(a: LatLon, b: LatLon): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// ponytail: naive O(n) linear scan for the closest track point to a live lat/lon - fine for
// GPX tracks of a normal ride's size; if tracks ever get huge, a spatial index (e.g. a grid or
// k-d tree) would be the upgrade
export function findNearestPointIndex(points: GpxPoint[], lat: number, lon: number): number {
  let bestIndex = -1;
  let bestDistance = Infinity;
  for (let i = 0; i < points.length; i += 1) {
    const d = distanceMeters(points[i], { lat, lon });
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = i;
    }
  }
  return bestIndex;
}

// distance along the track (m) at each point - index 0 is 0
export function cumulativeDistances(points: GpxPoint[]): number[] {
  const acc: number[] = points.length ? [0] : [];
  for (let i = 1; i < points.length; i += 1) acc.push(acc[i - 1] + distanceMeters(points[i - 1], points[i]));
  return acc;
}

// progress-aware match of a live position to a track index. where the track passes the same
// spot more than once (roundtrip start/finish, crossings, out-and-back) a plain nearest-point
// search flips between passes on GPS noise - instead, split nearby points into separate passes
// (runs of consecutive indices) and take the pass whose distance along the route is closest to
// where we expect the rider to be (expectedDistanceM)
export function matchTrackIndex(
  points: GpxPoint[],
  cumulative: number[],
  position: LatLon,
  expectedDistanceM: number,
): number {
  let bestIndex = -1;
  let bestGap = Infinity;
  // closest point of the pass currently being scanned
  let passIndex = -1;
  let passDistance = Infinity;

  const closePass = () => {
    if (passIndex < 0) return;
    const gap = Math.abs(cumulative[passIndex] - expectedDistanceM);
    if (gap < bestGap) {
      bestGap = gap;
      bestIndex = passIndex;
    }
    passIndex = -1;
    passDistance = Infinity;
  };

  for (let i = 0; i < points.length; i += 1) {
    const d = distanceMeters(points[i], position);
    if (d > MATCH_RADIUS_METERS) {
      closePass();
    } else if (d < passDistance) {
      passDistance = d;
      passIndex = i;
    }
  }
  closePass();

  // off-route: nothing nearby, fall back to the global nearest point
  return bestIndex >= 0 ? bestIndex : findNearestPointIndex(points, position.lat, position.lon);
}

export function remainingDistanceMeters(points: GpxPoint[], fromIndex: number): number {
  let total = 0;
  for (let i = Math.max(fromIndex, 0); i < points.length - 1; i += 1) {
    total += distanceMeters(points[i], points[i + 1]);
  }
  return total;
}

export function remainingElevationGainMeters(points: GpxPoint[], fromIndex: number): number {
  let total = 0;
  for (let i = Math.max(fromIndex, 0); i < points.length - 1; i += 1) {
    const delta = points[i + 1].ele - points[i].ele;
    if (delta > 0) total += delta;
  }
  return total;
}
