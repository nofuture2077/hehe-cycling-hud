export interface CyclingData {
  speedKmh: number;
  maxSpeedKmh: number;
  distanceKm: number;
  splitDistanceKm: number;
  city: string;
  region: string;
  country: string;
  countryFlag: string;
  temperatureC: number | null;
  feelsLikeC: number | null;
  windKmh: number | null;
  windGustKmh: number | null;
  // where the wind comes from, degrees
  windDirectionDeg: number | null;
  // relative humidity 0-1
  humidity: number | null;
  // WeatherKit's WeatherCondition raw value (clear, partlyCloudy, rain, ...), null when Moblin doesn't send it
  weatherCondition: string | null;
  isDaylight: boolean | null;
  localTime: string;
  gradientPercent: number;
  maxGradientPercent: number;
  elevationGainM: number;
  elevationLossM: number;
  splitElevationGainM: number;
  splitElevationLossM: number;
  // the current altitude (m above sea level), and the runs and lift rides it shows (core/runs.ts)
  altitudeM: number;
  runCount: number;
  onLift: boolean;
  heartRateBpm: number;
  powerWatts: number;
  sessionMaxHeartRateBpm: number;
  sessionMaxPowerWatts: number;
  latitude: number | null;
  longitude: number | null;
}

export interface LogoData {
  filename: string;
  mimeType: string;
  content: string; // base64-encoded
}

export interface GpxTrack {
  id: string;
  filename: string;
  content: string;
}

export interface PauseInfo {
  onBreak: boolean;
  currentBreakSeconds: number;
  totalBreakSeconds: number;
  breakCount: number;
}

export const defaultPause: PauseInfo = {
  onBreak: false, currentBreakSeconds: 0, totalBreakSeconds: 0, breakCount: 0,
};

export type MoblinConnectionStatus = 'waiting' | 'subscribed' | 'error';

// on-screen debug info since browser sources in OBS have no reachable devtools
export interface MoblinDebugInfo {
  telemetryCount: number;
  chatCount: number;
  lastChatUser: string | null;
  lastChatText: string | null;
  lastMessageError: string | null;
  lastChatRaw: string | null;
  lastTelemetryRaw: string | null;
}
