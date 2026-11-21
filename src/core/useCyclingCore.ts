import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { MoblinTelemetryData } from '../types/moblin';
import { parseMessage, isSystemMessageType, HeheChatMessage, SystemMessage } from '../commons/message';
import { version } from '../../package.json';
import { createGradientSmoother } from './smoothing';
import { createRunTracker, type RunState } from './runs';
import type {
  CyclingData, CyclingHudConfig, CyclingHudTheme, CyclingHudLayout, HudLook, LogoData, PauseInfo,
  GpxTrack, HudTexts, MoblinConnectionStatus, MoblinDebugInfo, TrackStyle,
} from './types';
import { defaultTexts, defaultTrackStyle } from './types';

interface Sections {
  enabled: boolean;
  location: boolean;
  locationCity: boolean;
  locationRegion: boolean;
  locationCountry: boolean;
  locationFlag: boolean;
  locationTemperature: boolean;
  locationWeather: boolean;
  locationWeatherAtmosphere: boolean;
  locationFeelsLike: boolean;
  locationWind: boolean;
  locationHumidity: boolean;
  locationLocalTime: boolean;
  distance: boolean;
  speed: boolean;
  gradient: boolean;
  elevation: boolean;
  heartRate: boolean;
  power: boolean;
  altitude: boolean;
  runs: boolean;
  vertical: boolean;
  split: boolean;
  showMax: boolean;
  debug: boolean;
  showGpxMap: boolean;
  showGpxElevationMap: boolean;
  showGpxPosition: boolean;
  showGpxElevationPosition: boolean;
  showGpxRemainingDistance: boolean;
  showGpxRemainingElevation: boolean;
  showGpxWaypoints: boolean;
  showLogo: boolean;
}

const defaultSections: Sections = {
  enabled: true,
  location: true,
  locationCity: true,
  locationRegion: false,
  locationCountry: false,
  locationFlag: true,
  locationTemperature: false,
  locationWeather: true,
  locationWeatherAtmosphere: false,
  locationFeelsLike: false,
  locationWind: false,
  locationHumidity: false,
  locationLocalTime: false,
  distance: true,
  speed: true,
  gradient: true,
  elevation: true,
  heartRate: true,
  power: true,
  altitude: true,
  runs: true,
  vertical: true,
  split: false,
  showMax: false,
  debug: false,
  showGpxMap: false,
  showGpxElevationMap: false,
  showGpxPosition: false,
  showGpxElevationPosition: false,
  showGpxRemainingDistance: false,
  showGpxRemainingElevation: false,
  showGpxWaypoints: false,
  showLogo: false,
};

// profile.config keys carrying each section's toggle, set via Settings > Connect > Moblin
const CONFIG_KEYS: Record<keyof Sections, string> = {
  enabled: 'cyclingHudEnabled',
  location: 'cyclingHudLocation',
  locationCity: 'cyclingHudLocationCity',
  locationRegion: 'cyclingHudLocationRegion',
  locationCountry: 'cyclingHudLocationCountry',
  locationFlag: 'cyclingHudLocationFlag',
  locationTemperature: 'cyclingHudLocationTemperature',
  locationWeather: 'cyclingHudLocationWeather',
  locationWeatherAtmosphere: 'cyclingHudLocationWeatherAtmosphere',
  locationFeelsLike: 'cyclingHudLocationFeelsLike',
  locationWind: 'cyclingHudLocationWind',
  locationHumidity: 'cyclingHudLocationHumidity',
  locationLocalTime: 'cyclingHudLocationLocalTime',
  distance: 'cyclingHudDistance',
  speed: 'cyclingHudSpeed',
  gradient: 'cyclingHudGradient',
  elevation: 'cyclingHudElevation',
  heartRate: 'cyclingHudHeartRate',
  power: 'cyclingHudPower',
  altitude: 'cyclingHudAltitude',
  runs: 'cyclingHudRuns',
  vertical: 'cyclingHudVertical',
  split: 'cyclingHudSplit',
  showMax: 'cyclingHudShowMax',
  debug: 'cyclingHudDebug',
  showGpxMap: 'showGpxMap',
  showGpxElevationMap: 'showGpxElevationMap',
  showGpxPosition: 'showGpxPosition',
  showGpxElevationPosition: 'showGpxElevationPosition',
  showGpxRemainingDistance: 'showGpxRemainingDistance',
  showGpxRemainingElevation: 'showGpxRemainingElevation',
  showGpxWaypoints: 'showGpxWaypoints',
  showLogo: 'cyclingHudShowLogo',
};

// the look of the track map and elevation profile, set per block of HeheChat's unified overlay source
function trackStyleFromConfig(source: Record<string, unknown> | undefined): TrackStyle {
  const { cyclingHudPanel: panel, cyclingHudLineColor: lineColor, cyclingHudGrid: grid,
    cyclingHudElevationFromZero: fromZero, cyclingHudElevationMinSpanM: minSpan } = source ?? {};
  return {
    panel: typeof panel === 'string' ? panel : defaultTrackStyle.panel,
    lineColor: typeof lineColor === 'string' ? lineColor : defaultTrackStyle.lineColor,
    grid: typeof grid === 'boolean' ? grid : defaultTrackStyle.grid,
    elevationFromZero: typeof fromZero === 'boolean' ? fromZero : defaultTrackStyle.elevationFromZero,
    elevationMinSpanM: typeof minSpan === 'number' && minSpan > 0 ? minSpan : defaultTrackStyle.elevationMinSpanM,
  };
}

// the words a block of HeheChat's unified overlay source sets (cyclingHudTextSpeed, ...), the defaults for the rest
function textsFromConfig(source: Record<string, unknown> | undefined): HudTexts {
  return Object.fromEntries(
    Object.entries(defaultTexts).map(([key, text]) => {
      const value = source?.[`cyclingHudText${key[0].toUpperCase()}${key.slice(1)}`];
      return [key, typeof value === 'string' ? value : text];
    }),
  ) as unknown as HudTexts;
}

// the overlay theme a block of HeheChat's unified overlay source hands over, null without one
function lookFromConfig(source: Record<string, unknown> | undefined): HudLook | null {
  const look = source?.cyclingHudLook;
  if (!look || typeof look !== 'object') return null;
  const { colors, font, labelFont, textFont, radius, shadow } = look as Record<string, unknown>;
  if (!colors || typeof colors !== 'object') return null;
  return {
    colors: colors as HudLook['colors'],
    font: typeof font === 'string' ? font : 'default',
    labelFont: typeof labelFont === 'string' ? labelFont : undefined,
    textFont: typeof textFont === 'string' ? textFont : undefined,
    radius: typeof radius === 'string' ? radius : 'small',
    shadow: typeof shadow === 'string' ? shadow : 'on',
  };
}

// gpxMapRadius is a number|null (null = full track), so it can't go through
// THRESHOLD_CONFIG_KEYS which only accepts plain numbers
function gpxMapRadiusFromConfig(profileConfig: Record<string, unknown> | undefined): number | null {
  const value = profileConfig?.gpxMapRadius;
  return typeof value === 'number' ? value : null;
}

function sectionsFromConfig(profileConfig: Record<string, unknown> | undefined): Sections {
  const result = { ...defaultSections };
  for (const key of Object.keys(CONFIG_KEYS) as (keyof Sections)[]) {
    const value = profileConfig?.[CONFIG_KEYS[key]];
    if (typeof value === 'boolean') result[key] = value;
  }
  return result;
}

interface Thresholds {
  delaySeconds: number;
  minSpeedKmh: number;
  minGradientPercent: number;
  gradientOnlyWhenMoving: boolean;
  hideLingerSeconds: number;
  pauseEnabled: boolean;
  pauseStartAfterSeconds: number;
  pauseResumeSpeedKmh: number;
  pauseMinDistanceM: number;
  maxHeartRateBpm: number;
  averagePowerWatts: number;
  goalDistanceKm: number;
  goalElevationM: number;
}

const defaultThresholds: Thresholds = {
  delaySeconds: 10,
  minSpeedKmh: 1,
  minGradientPercent: 1,
  gradientOnlyWhenMoving: true,
  hideLingerSeconds: 10,
  pauseEnabled: false,
  pauseStartAfterSeconds: 30,
  pauseResumeSpeedKmh: 5,
  pauseMinDistanceM: 100,
  maxHeartRateBpm: 190,
  averagePowerWatts: 250,
  goalDistanceKm: 0,
  goalElevationM: 0,
};

// profile.config keys carrying each threshold, set via Settings > Connect > Moblin
const THRESHOLD_CONFIG_KEYS: Record<keyof Thresholds, string> = {
  delaySeconds: 'cyclingHudDelaySeconds',
  minSpeedKmh: 'cyclingHudMinSpeedKmh',
  minGradientPercent: 'cyclingHudMinGradientPercent',
  gradientOnlyWhenMoving: 'cyclingHudGradientOnlyWhenMoving',
  hideLingerSeconds: 'cyclingHudHideLingerSeconds',
  pauseEnabled: 'cyclingHudPauseEnabled',
  pauseStartAfterSeconds: 'cyclingHudPauseStartAfterSeconds',
  pauseResumeSpeedKmh: 'cyclingHudPauseResumeSpeedKmh',
  pauseMinDistanceM: 'cyclingHudPauseMinDistanceM',
  maxHeartRateBpm: 'cyclingHudMaxHeartRateBpm',
  averagePowerWatts: 'cyclingHudAveragePowerWatts',
  goalDistanceKm: 'cyclingHudGoalDistanceKm',
  goalElevationM: 'cyclingHudGoalElevationM',
};

const THRESHOLD_BOOLEAN_KEYS: (keyof Thresholds)[] = ['gradientOnlyWhenMoving', 'pauseEnabled'];

function thresholdsFromConfig(profileConfig: Record<string, unknown> | undefined): Thresholds {
  const result: Record<string, unknown> = { ...defaultThresholds };
  for (const key of Object.keys(THRESHOLD_CONFIG_KEYS) as (keyof Thresholds)[]) {
    const value = profileConfig?.[THRESHOLD_CONFIG_KEYS[key]];
    const expectBoolean = THRESHOLD_BOOLEAN_KEYS.includes(key);
    if (typeof value === (expectBoolean ? 'boolean' : 'number')) result[key] = value;
  }
  return result as unknown as Thresholds;
}

// profile.config key carrying the HUD's visual theme, set via Settings > Connect > Moblin. Core
// doesn't know or validate which theme names exist - it's a raw passthrough string, since which
// names are valid is a decision for whichever HUD layer renders the theme
const THEME_CONFIG_KEY = 'cyclingHudTheme';
const DEFAULT_THEME: CyclingHudTheme = 'classic';

function themeFromConfig(profileConfig: Record<string, unknown> | undefined): CyclingHudTheme {
  const value = profileConfig?.[THEME_CONFIG_KEY];
  return typeof value === 'string' && value.length > 0 ? value : DEFAULT_THEME;
}

// profile.config key carrying the HUD's widget arrangement - independent of theme, so a theme
// and a layout can be picked separately. Same raw-passthrough treatment as theme above.
const LAYOUT_CONFIG_KEY = 'cyclingHudLayout';
const DEFAULT_LAYOUT: CyclingHudLayout = 'default';

function layoutFromConfig(profileConfig: Record<string, unknown> | undefined): CyclingHudLayout {
  const value = profileConfig?.[LAYOUT_CONFIG_KEY];
  return typeof value === 'string' && value.length > 0 ? value : DEFAULT_LAYOUT;
}

// HeheChat's unified overlay source passes a block's settings in the hash instead (see useCyclingCore): the same keys
// as the profile config, plus the logo as an image of the block (data URL), shown whenever there is one
function logoFromSettings(settings: Record<string, unknown>): LogoData | null {
  const image = Array.isArray(settings.cyclingHudLogo) ? settings.cyclingHudLogo[0] : undefined;
  const match = typeof image?.data === 'string' ? /^data:([^;,]+);base64,(.*)$/.exec(image.data) : null;
  return match ? { filename: 'logo', mimeType: match[1], content: match[2] } : null;
}

const emptyPause: PauseInfo = {
  onBreak: false, currentBreakSeconds: 0, totalBreakSeconds: 0, breakCount: 0,
};

const PAUSE_STORAGE_KEY = 'cyclingHudPauseStats';

// ponytail: survives a browser-source reload; resetSignal (new stream) still wipes it via clearPauseStorage
function loadPauseStorage(): { totalBreakMs: number; breakCount: number } {
  try {
    const raw = localStorage.getItem(PAUSE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed.totalBreakMs === 'number' && typeof parsed.breakCount === 'number') return parsed;
  } catch {
    // ignore corrupt/unavailable storage
  }
  return { totalBreakMs: 0, breakCount: 0 };
}

function savePauseStorage(totalBreakMs: number, breakCount: number): void {
  try {
    localStorage.setItem(PAUSE_STORAGE_KEY, JSON.stringify({ totalBreakMs, breakCount }));
  } catch {
    // ignore unavailable storage
  }
}

type PauseThresholds = Pick<
  Thresholds,
  'pauseEnabled' | 'minSpeedKmh' | 'pauseStartAfterSeconds' | 'pauseResumeSpeedKmh' | 'pauseMinDistanceM'
>;

// tracks stopped time as "breaks": counts once stopped for pauseStartAfterSeconds, and only
// ends once speed clears pauseResumeSpeedKmh - so briefly walking the bike around (GPS still
// moving at walking pace) doesn't end the break early. Also requires pauseMinDistanceM of riding
// since the ride start (or since the previous break ended) before a break can start, so idling
// before setting off - or a quick on/off-the-bike shuffle - doesn't get counted. Waits for real
// telemetry (hasData) before capturing the baseline distance, since Moblin's trip distance isn't
// reset per stream - capturing it too early (e.g. against the 0 fallback before data arrives)
// would let a carried-over distance look like it was just ridden. Also fully resets (via
// resetSignal, bumped on a "streamOnline" event) on each new stream, since the browser source
// isn't reloaded between streams and leftover ridden distance from a previous stream would
// otherwise satisfy pauseMinDistanceM instantly at the next stream's start
function usePauseTracking(
  speedKmh: number,
  distanceKm: number,
  thresholds: PauseThresholds,
  hasData: boolean,
  resetSignal: number
): PauseInfo {
  const [pause, setPause] = useState<PauseInfo>(emptyPause);
  const speedRef = useRef(speedKmh);
  speedRef.current = speedKmh;
  const distanceRef = useRef(distanceKm);
  distanceRef.current = distanceKm;
  const hasDataRef = useRef(hasData);
  hasDataRef.current = hasData;
  // first mount should restore saved stats; a later resetSignal bump (new stream) should wipe them
  const isFirstRunRef = useRef(true);

  const {
    pauseEnabled, minSpeedKmh, pauseStartAfterSeconds, pauseResumeSpeedKmh, pauseMinDistanceM,
  } = thresholds;

  useEffect(() => {
    if (!pauseEnabled) {
      setPause(emptyPause);
      return undefined;
    }

    const stored = isFirstRunRef.current ? loadPauseStorage() : { totalBreakMs: 0, breakCount: 0 };
    isFirstRunRef.current = false;
    savePauseStorage(stored.totalBreakMs, stored.breakCount);
    let notMovingSince: number | null = null;
    let breakStart: number | null = null;
    let totalBreakMs = stored.totalBreakMs;
    let breakCount = stored.breakCount;
    let baselineDistanceKm: number | null = null;

    const id = setInterval(() => {
      if (!hasDataRef.current) return;

      const now = Date.now();
      const speed = speedRef.current;
      const distance = distanceRef.current;

      if (baselineDistanceKm === null) baselineDistanceKm = distance;
      const riddenEnough = distance - baselineDistanceKm >= pauseMinDistanceM / 1000;

      if (breakStart === null) {
        if (riddenEnough && speed < minSpeedKmh) {
          if (notMovingSince === null) notMovingSince = now;
          if (now - notMovingSince >= pauseStartAfterSeconds * 1000) breakStart = notMovingSince;
        } else {
          notMovingSince = null;
        }
      } else if (speed >= pauseResumeSpeedKmh) {
        totalBreakMs += now - breakStart;
        breakCount += 1;
        breakStart = null;
        notMovingSince = null;
        baselineDistanceKm = distance;
        savePauseStorage(totalBreakMs, breakCount);
      }

      const currentBreakMs = breakStart !== null ? now - breakStart : 0;
      setPause({
        onBreak: breakStart !== null,
        currentBreakSeconds: Math.floor(currentBreakMs / 1000),
        totalBreakSeconds: Math.floor((totalBreakMs + currentBreakMs) / 1000),
        breakCount,
      });
    }, 1000);

    return () => clearInterval(id);
  }, [
    pauseEnabled, minSpeedKmh, pauseStartAfterSeconds, pauseResumeSpeedKmh,
    pauseMinDistanceM, resetSignal,
  ]);

  return pause;
}

function getQueryVariable(query: string, variable: string): string | undefined {
  for (const pair of query.split('&')) {
    const [key, value] = pair.split('=');
    if (decodeURIComponent(key) === variable) return decodeURIComponent(value);
  }
  return undefined;
}

function str(value: string | null | undefined): string {
  return value ?? '';
}

// Moblin's `date` is a Swift-encoded Date (seconds since 2001-01-01T00:00:00Z), not the Unix
// epoch - RemoteControl.swift's JSONEncoder/JSONDecoder calls don't set a dateEncodingStrategy,
// so Foundation falls back to that reference date
const SWIFT_REFERENCE_DATE_UNIX_SECONDS = 978307200;

function toLocalTime(dateSeconds: number | null, timezone: string | null): string {
  if (dateSeconds === null || !timezone) return '';
  const unixMs = (dateSeconds + SWIFT_REFERENCE_DATE_UNIX_SECONDS) * 1000;
  try {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: timezone })
      .format(new Date(unixMs));
  } catch {
    // unknown/invalid IANA identifier
    return '';
  }
}

// telemetry fields can be null/missing on individual messages - fall back to 0 rather than crash on NaN
function num(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

// heartRates carries one entry per paired sensor - take the first real reading, whichever sensor it's from
function firstHeartRate(heartRates: Record<string, number | null> | undefined): number {
  if (!heartRates) return 0;
  for (const bpm of Object.values(heartRates)) {
    if (typeof bpm === 'number' && Number.isFinite(bpm)) return bpm;
  }
  return 0;
}

function toCyclingData(
  t: MoblinTelemetryData,
  maxSpeedKmh: number,
  gradientPercent: number,
  maxGradientPercent: number,
  sessionMaxHeartRateBpm: number,
  sessionMaxPowerWatts: number,
  runs: RunState,
): CyclingData {
  return {
    speedKmh: num(t.data.speed) * 3.6,
    maxSpeedKmh,
    distanceKm: num(t.data.distance) / 1000,
    splitDistanceKm: num(t.data.splitDistance) / 1000,
    city: str(t.data.city),
    region: str(t.data.state),
    country: str(t.data.country),
    countryFlag: str(t.data.countryFlag),
    temperatureC: t.data.temperature ?? null,
    feelsLikeC: t.data.feelsLikeTemperature ?? null,
    windKmh: t.data.windSpeed == null ? null : t.data.windSpeed * 3.6,
    windGustKmh: t.data.windGust == null ? null : t.data.windGust * 3.6,
    windDirectionDeg: t.data.windDirection ?? null,
    humidity: t.data.humidity ?? null,
    weatherCondition: t.data.condition ?? null,
    isDaylight: t.data.isDaylight ?? null,
    localTime: toLocalTime(t.data.date, t.data.timeZone),
    gradientPercent,
    maxGradientPercent,
    elevationGainM: num(t.data.altitudeAscent),
    elevationLossM: num(t.data.altitudeDescent),
    splitElevationGainM: num(t.data.splitAltitudeAscent),
    splitElevationLossM: num(t.data.splitAltitudeDescent),
    altitudeM: num(t.data.altitude),
    runCount: runs.runCount,
    onLift: runs.onLift,
    heartRateBpm: firstHeartRate(t.data.heartRates),
    powerWatts: num(t.data.cyclingPower),
    sessionMaxHeartRateBpm,
    sessionMaxPowerWatts,
    latitude: t.data.latitude,
    longitude: t.data.longitude,
  };
}

export type { MoblinConnectionStatus, MoblinDebugInfo, GpxTrack, LogoData };

interface BackendMessage {
  type?: string;
  data?: MoblinTelemetryData['data'] & { message?: string };
  profile?: { config?: Record<string, unknown> & { channels?: string[] } };
}

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;
const RECONNECT_BACKOFF = 1.5;

function calcReconnectDelay(attempts: number): number {
  const delay = INITIAL_RECONNECT_DELAY_MS * RECONNECT_BACKOFF ** attempts;
  return Math.min(delay, MAX_RECONNECT_DELAY_MS);
}

const emptyDebug: MoblinDebugInfo = {
  telemetryCount: 0,
  chatCount: 0,
  lastChatUser: null,
  lastChatText: null,
  lastMessageError: null,
  lastChatRaw: null,
  lastTelemetryRaw: null,
};

// dumps the actual payload shape on screen so we can see real key names without devtools
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// public entry point of the "core" layer: owns the WebSocket connection, telemetry parsing,
// session/pause tracking, and config resolution. Any HUD layout - the built-in one or a
// third-party replacement - is meant to call only this hook and render from its output, without
// reimplementing the connection or domain logic itself.
// settings: the settings of a block of HeheChat's unified overlay source (a cluster shown on its
// own), which replace the profile config and the uploaded logo; null for the standalone HUD
export function useCyclingCore(settings: Record<string, unknown> | null = null): {
  data: CyclingData | null;
  config: CyclingHudConfig;
  // false until the first sharedata/profile message - render nothing before this, or the
  // default theme/layout flashes for a moment before the user's real one arrives
  configLoaded: boolean;
  pause: PauseInfo;
  status: MoblinConnectionStatus;
  error: string | null;
  debug: MoblinDebugInfo;
  debugVisible: boolean;
  gpxTrack: GpxTrack | null;
  logo: LogoData | null;
} {
  const [data, setData] = useState<CyclingData | null>(null);
  // the profile config, undefined until the first sharedata/profile message
  const [profileConfig, setProfileConfig] = useState<Record<string, unknown> | undefined>(undefined);
  const [gpxTrack, setGpxTrack] = useState<GpxTrack | null>(null);
  const [uploadedLogo, setLogo] = useState<LogoData | null>(null);
  const [status, setStatus] = useState<MoblinConnectionStatus>('waiting');
  const [error, setError] = useState<string | null>(null);
  const [streamStartSignal, setStreamStartSignal] = useState(0);
  const [debug, setDebug] = useState<MoblinDebugInfo>(emptyDebug);
  // telemetry is buffered here and released after delaySeconds, to line the HUD up with the
  // stream's video delay - see the flush effect below
  const bufferRef = useRef<{ t: number; data: CyclingData }[]>([]);
  // running session maxima, tracked off the raw (undelayed) telemetry so they aren't capped by
  // whatever's still sitting in the buffer; reset on streamStartSignal like pause tracking
  const maxSpeedRef = useRef(0);
  const maxGradientRef = useRef(0);
  const maxHeartRateSessionRef = useRef(0);
  const maxPowerSessionRef = useRef(0);
  const gradientSmootherRef = useRef(createGradientSmoother());
  const runTrackerRef = useRef(createRunTracker());
  useEffect(() => {
    maxSpeedRef.current = 0;
    maxGradientRef.current = 0;
    maxHeartRateSessionRef.current = 0;
    maxPowerSessionRef.current = 0;
    gradientSmootherRef.current.reset();
    runTrackerRef.current.reset();
  }, [streamStartSignal]);

  // telemetry comes from HeheServer over a plain WebSocket, using the same
  // browser-source sink token as chat/alert sources - independent of any Moblin browser-source
  // lifecycle, so both keep updating while backgrounded/not rendered by Moblin.
  // A widget of HeheChat's unified overlay source (settings given) opens no connection: the
  // overlay relays the messages it needs (Stats, gpx-track, streamOnline) from its own one
  const widgetMode = settings !== null;
  useEffect(() => {
    const token = getQueryVariable(window.location.hash.substring(1), 'token');

    // what a backend message changes; send answers over the connection (none in widget mode)
    function handleMessage(msg: BackendMessage, send?: (data: Record<string, unknown>) => void) {
      // the active GPX track, pushed by HeheServer whenever the user selects one in
      // HeheChat > Settings > Connect > GPX (or immediately on connect if one is already active)
      if (msg.type === 'gpx-track') {
        // null: the streamer follows no track any more
        const track = (msg as unknown as { data?: GpxTrack | null }).data;
        setGpxTrack(track ?? null);
        return;
      }

      // the active logo, pushed by HeheServer whenever the user uploads/removes one in
      // HeheChat > Settings > Connect > Moblin (or immediately on connect if one is already set)
      if (msg.type === 'logo') {
        const logoData = (msg as unknown as { data?: LogoData | null }).data;
        setLogo(logoData ?? null);
        return;
      }

      // sharedata arrives right after the sink handshake - use it to subscribe to the
      // channel(s) we belong to (starts the telemetry feed) and to read the HUD section
      // toggles from Settings > Connect > Moblin
      if (msg.type === 'sharedata') {
        const channels = msg.profile?.config?.channels ?? [];
        if (channels.length && send) {
          send({
            type: 'subscribe',
            token,
            source: 'Telemetry HUD',
            version,
            channels: Object.fromEntries(channels.map((c) => [c, true])),
          });
        }
        setProfileConfig(msg.profile?.config ?? {});
        return;
      }

      // pushed whenever the user changes settings elsewhere while this source stays open
      if (msg.type === 'profile') {
        setProfileConfig(msg.profile?.config ?? {});
        return;
      }

      // chat itself isn't used for HUD control anymore (moved to Settings > Connect > Moblin),
      // but keep receiving it - a future feature will show chat overlaid on the HUD
      if (msg.type === 'msg') {
        // a fresh stream start means the rider hasn't ridden anything yet this session, even
        // though Moblin's cumulative distance isn't reset - use it to reset pause tracking so
        // leftover distance from a previous stream can't immediately satisfy pauseMinDistanceM
        if (msg.data?.message) {
          try {
            const parsed = parseMessage(msg.data.message);
            if (isSystemMessageType(parsed) && (parsed as SystemMessage).subType === 'streamOnline') {
              setStreamStartSignal((s) => s + 1);
            }
          } catch {
            // ignore malformed lines - handleIncomingChat below already guards its own parse
          }
        }
        handleIncomingChat(msg.data?.message, setDebug);
        return;
      }

      if (msg.type === 'Stats' && msg.data) {
        setDebug((d) => ({
          ...d,
          telemetryCount: d.telemetryCount + 1,
          lastTelemetryRaw: safeStringify(msg.data),
        }));
        const speedKmh = num(msg.data.speed) * 3.6;
        const gradientPercent = gradientSmootherRef.current.push(num(msg.data.slopePercent), Date.now());
        const heartRateBpm = firstHeartRate(msg.data.heartRates);
        const powerWatts = num(msg.data.cyclingPower);
        maxSpeedRef.current = Math.max(maxSpeedRef.current, speedKmh);
        maxGradientRef.current = Math.max(maxGradientRef.current, Math.abs(gradientPercent));
        maxHeartRateSessionRef.current = Math.max(maxHeartRateSessionRef.current, heartRateBpm);
        maxPowerSessionRef.current = Math.max(maxPowerSessionRef.current, powerWatts);
        bufferRef.current.push({
          t: Date.now(),
          data: toCyclingData(
            { data: msg.data },
            maxSpeedRef.current,
            gradientPercent,
            maxGradientRef.current,
            maxHeartRateSessionRef.current,
            maxPowerSessionRef.current,
            runTrackerRef.current.push(msg.data.altitude),
          ),
        });
      }
    }

    if (widgetMode) {
      const onMessage = (ev: MessageEvent) => {
        if (ev.source === window.parent && ev.data?.type === 'hehe-hud:message' && ev.data.data) {
          handleMessage(ev.data.data);
        }
      };
      window.addEventListener('message', onMessage);
      // the overlay answers with what it already has, e.g. the active GPX track
      window.parent.postMessage({ type: 'hehe-hud:ready' }, '*');
      setStatus('subscribed');
      return () => window.removeEventListener('message', onMessage);
    }

    if (!token) {
      setStatus('error');
      setError('Fehlender Token - wurde diese URL aus HeheChat > Settings > Connect > Moblin kopiert?');
      return undefined;
    }

    const heheWsUrl = import.meta.env.VITE_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

    let cancelled = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    function connect() {
      if (cancelled) return;
      ws = new WebSocket(heheWsUrl);

      ws.addEventListener('open', () => {
        attempts = 0;
        ws!.send(JSON.stringify({ type: 'sink', source: 'Telemetry HUD', token }));
        // second handshake on the same connection, same token - HeheServer registers this
        // socket under the user's channel and pushes gpx-track messages to it (see websocket.js)
        ws!.send(JSON.stringify({ type: 'cycling-hud-client', token }));
        setStatus('subscribed');
        setError(null);
      });

      ws.addEventListener('message', (event) => {
        let msg: BackendMessage;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        if (msg.type === 'heartbeat') {
          ws!.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        handleMessage(msg, (data) => ws!.send(JSON.stringify(data)));
      });

      ws.addEventListener('close', () => {
        if (cancelled) return;
        setStatus('waiting');
        const delay = calcReconnectDelay(attempts);
        attempts += 1;
        reconnectTimer = setTimeout(connect, delay);
      });
    }

    connect();

    function onVisible() {
      if (document.visibilityState === 'visible' && ws?.readyState !== WebSocket.OPEN) {
        clearTimeout(reconnectTimer);
        connect();
      }
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      document.removeEventListener('visibilitychange', onVisible);
      ws?.close();
    };
  }, []);

  const source = settings ?? profileConfig;
  const logo = settings ? logoFromSettings(settings) : uploadedLogo;
  const sections = { ...sectionsFromConfig(source), ...(settings ? { showLogo: true } : {}) };
  const thresholds = thresholdsFromConfig(source);
  const gpxMapRadius = gpxMapRadiusFromConfig(source);
  const theme = themeFromConfig(source);
  const layout = layoutFromConfig(source);
  const configLoaded = source !== undefined;

  // releases buffered telemetry once it's old enough, so the HUD lags behind live by delaySeconds
  useEffect(() => {
    const delayMs = thresholds.delaySeconds * 1000;
    const id = setInterval(() => {
      const now = Date.now();
      const buffer = bufferRef.current;
      let released: CyclingData | undefined;
      while (buffer.length && now - buffer[0].t >= delayMs) {
        released = buffer.shift()!.data;
      }
      if (released) setData(released);
    }, 200);
    return () => clearInterval(id);
  }, [thresholds.delaySeconds]);

  const pause = usePauseTracking(
    data?.speedKmh ?? 0, data?.distanceKm ?? 0, thresholds, data !== null, streamStartSignal
  );

  // master switch: when off, every element hides - including the pause gauge, which isn't a
  // visibility flag. Pause tracking itself keeps running so stats survive toggling it back on
  const on = sections.enabled;
  const config: CyclingHudConfig = {
    theme,
    layout,
    visible: {
      speed: on && sections.speed,
      distance: on && sections.distance,
      location: on && sections.location,
      locationCity: on && sections.locationCity,
      locationRegion: on && sections.locationRegion,
      locationCountry: on && sections.locationCountry,
      locationFlag: on && sections.locationFlag,
      locationTemperature: on && sections.locationTemperature,
      locationWeather: on && sections.locationWeather,
      locationWeatherAtmosphere: on && sections.locationWeatherAtmosphere,
      locationFeelsLike: on && sections.locationFeelsLike,
      locationWind: on && sections.locationWind,
      locationHumidity: on && sections.locationHumidity,
      locationLocalTime: on && sections.locationLocalTime,
      gradient: on && sections.gradient,
      elevation: on && sections.elevation,
      heartRate: on && sections.heartRate,
      power: on && sections.power,
      altitude: on && sections.altitude,
      runs: on && sections.runs,
      vertical: on && sections.vertical,
      split: on && sections.split,
      showMax: on && sections.showMax,
      showGpxMap: on && sections.showGpxMap,
      showGpxElevationMap: on && sections.showGpxElevationMap,
      showGpxPosition: on && sections.showGpxPosition,
      showGpxElevationPosition: on && sections.showGpxElevationPosition,
      showGpxRemainingDistance: on && sections.showGpxRemainingDistance,
      showGpxRemainingElevation: on && sections.showGpxRemainingElevation,
      showGpxWaypoints: on && sections.showGpxWaypoints,
      showLogo: on && sections.showLogo,
    },
    minSpeedKmh: thresholds.minSpeedKmh,
    minGradientPercent: thresholds.minGradientPercent,
    gradientOnlyWhenMoving: thresholds.gradientOnlyWhenMoving,
    hideLingerMs: thresholds.hideLingerSeconds * 1000,
    maxHeartRateBpm: thresholds.maxHeartRateBpm,
    averagePowerWatts: thresholds.averagePowerWatts,
    goalDistanceKm: thresholds.goalDistanceKm,
    goalElevationM: thresholds.goalElevationM,
    gpxMapRadius,
    trackStyle: trackStyleFromConfig(source),
    look: lookFromConfig(source),
    texts: textsFromConfig(source),
  };

  return { data, config, configLoaded, pause: on ? pause : emptyPause, status, error, debug, debugVisible: sections.debug, gpxTrack, logo };
}

// deprecated: kept as an alias for one release so nothing importing the old Moblin-specific name
// breaks mid-migration. New code should import `useCyclingCore`.
export const useMoblinCyclingHud = useCyclingCore;

// a bad chat payload here must never break the WS message pipe or crash the page
function handleIncomingChat(
  rawLine: string | undefined,
  setDebug: Dispatch<SetStateAction<MoblinDebugInfo>>
) {
  if (!rawLine) return;
  try {
    const msg = parseMessage(rawLine);
    if (isSystemMessageType(msg)) return;
    const chat = msg as HeheChatMessage;
    setDebug((d) => ({
      ...d,
      chatCount: d.chatCount + 1,
      lastChatUser: chat.userInfo?.userName ?? null,
      lastChatText: chat.text,
      lastChatRaw: safeStringify(rawLine),
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setDebug((d) => ({ ...d, lastMessageError: msg }));
  }
}
