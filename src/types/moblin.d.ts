export interface MoblinTelemetryData {
  data: {
    speed: number;
    averageSpeed: number;
    altitude: number;
    latitude: number | null;
    longitude: number | null;
    distance: number;
    splitDistance: number;
    slopePercent: number;
    altitudeAscent: number;
    altitudeDescent: number;
    splitAltitudeAscent: number;
    splitAltitudeDescent: number;
    temperature: number | null;
    feelsLikeTemperature: number | null;
    windSpeed: number | null;
    windGust: number | null;
    // sent by Moblin versions after 2026-11 only: degrees the wind comes from, relative humidity 0-1, WeatherKit's
    // WeatherCondition raw value (clear, partlyCloudy, rain, ...) and whether it is day where the phone is
    windDirection?: number | null;
    humidity?: number | null;
    condition?: string | null;
    isDaylight?: boolean | null;
    country: string | null;
    countryFlag: string | null;
    state: string | null;
    area: string | null;
    city: string | null;
    neighborhood: string | null;
    // seconds since the Swift reference date (2001-01-01T00:00:00Z), not the Unix epoch -
    // JSONEncoder/JSONDecoder default to encoding Date as a Double in that reference
    date: number | null;
    // IANA identifier, e.g. "Europe/Berlin"
    timeZone: string | null;
    heartRates: Record<string, number | null>;
    activeEnergyBurned: number | null;
    workoutDistance: number | null;
    power: number | null;
    stepCount: number | null;
    cyclingPower: number;
    cyclingCadence: number;
    runningMetrics: Record<string, { speed?: number; cadence?: number; distance?: number }>;
    gForce: { now: number; recentMax: number; max: number } | null;
  };
}

export interface MoblinChatPostSegment {
  text?: string;
  emote?: string;
}

// Codable enum case with associated values - the payload nests the actual fields one level
// deeper under "message", e.g. { message: { user, segments } }
export interface MoblinChatMessage {
  message: {
    user: string;
    segments: MoblinChatPostSegment[];
  };
}

export interface MoblinMessage {
  chat?: MoblinChatMessage;
  telemetry?: MoblinTelemetryData;
}

export interface MoblinApi {
  subscribe: (options: { chat?: { prefix: string | null }; telemetry?: Record<string, never> }) => void;
  onmessage: ((data: MoblinMessage) => void) | null;
}

declare global {
  // injected as a bare script-global at document-start, not on window - always guard with
  // `typeof moblin !== 'undefined'`, a direct reference throws ReferenceError before that
  const moblin: MoblinApi;
}
