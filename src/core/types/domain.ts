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
  localTime: string;
  gradientPercent: number;
  maxGradientPercent: number;
  elevationGainM: number;
  elevationLossM: number;
  splitElevationGainM: number;
  splitElevationLossM: number;
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
