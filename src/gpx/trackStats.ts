import type { GpxPoint } from './parseGpx';

export interface LatLon {
  lat: number;
  lon: number;
}

// distance (m) below which a live position is considered "on" the track - shared by TrackMap
// and ElevationProfile so both agree on when to draw the live-position marker
export const CLOSE_THRESHOLD_METERS = 50;

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
