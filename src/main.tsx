import { Component, type ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { type CyclingData, useCyclingCore } from './core';
import { getLayout } from './hud/registry';
import { isHudWidget } from './hud/layouts/widget';
import { useVersionCheck } from './hooks/useVersionCheck';

const { Component: CyclingHud } = getLayout('default');

// ponytail: fallback so the design still renders when opened outside a Moblin browser source
const previewData: CyclingData = {
  speedKmh: 0,
  maxSpeedKmh: 0,
  distanceKm: 0,
  splitDistanceKm: 0,
  city: 'Tokyo',
  region: 'Tokyo',
  country: 'Japan',
  countryFlag: '🇯🇵',
  temperatureC: 20,
  feelsLikeC: 18,
  windKmh: 12,
  windGustKmh: 21,
  windDirectionDeg: 240,
  humidity: 0.6,
  weatherCondition: 'clear',
  isDaylight: true,
  localTime: '09:00',
  gradientPercent: 0,
  maxGradientPercent: 0,
  elevationGainM: 0,
  elevationLossM: 0,
  splitElevationGainM: 0,
  splitElevationLossM: 0,
  altitudeM: 0,
  runCount: 0,
  onLift: false,
  heartRateBpm: 0,
  powerWatts: 0,
  sessionMaxHeartRateBpm: 0,
  sessionMaxPowerWatts: 0,
  latitude: null,
  longitude: null,
};

// shown instead of previewData when HeheChat's settings preview embeds the HUD (#...&preview=true)
const isPreview = new URLSearchParams(window.location.hash.slice(1)).get('preview') === 'true';
const demoData: CyclingData = {
  ...previewData,
  speedKmh: 27.4,
  maxSpeedKmh: 48.1,
  distanceKm: 42.3,
  splitDistanceKm: 12.1,
  gradientPercent: 4.2,
  maxGradientPercent: 9.8,
  elevationGainM: 610,
  elevationLossM: 540,
  splitElevationGainM: 180,
  splitElevationLossM: 150,
  altitudeM: 2937,
  runCount: 7,
  heartRateBpm: 142,
  powerWatts: 215,
  sessionMaxHeartRateBpm: 171,
  sessionMaxPowerWatts: 480,
};

// the preview goes through the weather icons, one every few seconds, so the streamer sees each of them
const DEMO_WEATHER: [string, boolean][] = [
  ['clear', true],
  ['partlyCloudy', true],
  ['cloudy', true],
  ['drizzle', true],
  ['rain', true],
  ['heavyRain', true],
  ['thunderstorms', true],
  ['snow', true],
  ['foggy', true],
  ['windy', true],
  ['clear', false],
];

function useDemoWeather(on: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!on) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % DEMO_WEATHER.length), 4000);
    return () => clearInterval(timer);
  }, [on]);

  const [weatherCondition, isDaylight] = DEMO_WEATHER[index];
  return { weatherCondition, isDaylight };
}

// the preview rides the slope too, so the streamer sees the altimeter scroll and the run number turn into a lift
// ticket: a run down (RIDE_S seconds), then the lift back up (LIFT_S seconds), the run number one more each time
const RIDE_S = 12;
const LIFT_S = 8;
const DROP_M = 144;

function useDemoRide(on: boolean) {
  const [second, setSecond] = useState(0);

  useEffect(() => {
    if (!on) return;
    const timer = setInterval(() => setSecond((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [on]);

  const lap = Math.floor(second / (RIDE_S + LIFT_S));
  const at = second % (RIDE_S + LIFT_S);
  const onLift = at >= RIDE_S;
  return {
    onLift,
    runCount: demoData.runCount + lap,
    altitudeM: onLift ? demoData.altitudeM - DROP_M + ((at - RIDE_S) * DROP_M) / LIFT_S : demoData.altitudeM - (at * DROP_M) / RIDE_S,
    speedKmh: onLift ? 18 : 34 + 9 * Math.sin(second),
    elevationLossM: demoData.elevationLossM + lap * DROP_M + (onLift ? DROP_M : (at * DROP_M) / RIDE_S),
  };
}

interface BannerProps {
  background: string;
  color: string;
  children: ReactNode;
}

function Banner({ background, color, children }: BannerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '10px 16px',
        background,
        color,
        fontFamily: 'sans-serif',
        fontSize: 14,
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
}

// a bad telemetry field must never take the whole overlay down with it
class HudErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <Banner background="#c62828" color="#fff">HUD-Renderfehler: {this.state.error.message}</Banner>;
    }
    return this.props.children;
  }
}

function DebugPanel({ status, debug }: { status: string; debug: ReturnType<typeof useCyclingCore>['debug'] }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.75)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 1.5,
        zIndex: 9999,
        whiteSpace: 'pre',
      }}
    >
      {`status: ${status}
telemetry messages: ${debug.telemetryCount}
chat messages: ${debug.chatCount}
last chat user: ${debug.lastChatUser ?? '-'}
last chat text: ${debug.lastChatText ?? '-'}
last message error: ${debug.lastMessageError ?? '-'}
last chat raw: ${debug.lastChatRaw ?? '-'}
last telemetry raw: ${debug.lastTelemetryRaw ?? '-'}`}
    </div>
  );
}

// HeheChat's unified overlay source shows one cluster per frame (#...&widget=gauges&slot=bottom-right&settings={...})
// with the settings of its block, and moves a frame or changes its settings by changing its hash, which doesn't
// reload the page
const hashParam = (name: string) => new URLSearchParams(window.location.hash.slice(1)).get(name);
const widgetParam = hashParam('widget');
const widget = isHudWidget(widgetParam) ? widgetParam : undefined;

function readSettings(): Record<string, unknown> {
  try {
    const settings = JSON.parse(hashParam('settings') ?? '{}');
    return settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {};
  } catch {
    return {};
  }
}

function useHashParam<T>(read: () => T) {
  const [value, setValue] = useState(read);

  useEffect(() => {
    const update = () => setValue(read);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return value;
}

const readSlot = () => hashParam('slot') ?? undefined;
// the standalone HUD reads its settings from the profile
const readWidgetSettings = () => (widget ? readSettings() : null);

function CyclingRoot() {
  const settings = useHashParam(readWidgetSettings);
  const { data, config, configLoaded, pause, status, error, debug, debugVisible, gpxTrack, logo } = useCyclingCore(settings);
  const slot = useHashParam(readSlot);
  const demoWeather = useDemoWeather(isPreview && !data);
  const demoRide = useDemoRide(isPreview && !data);

  // Long-lived browser-source sessions must pick up a new build without a manual OBS reload.
  useVersionCheck({
    checkInterval: 30 * 60 * 1000,
    remoteManifestUrl: window.location.origin + '/manifest.json',
    onNewVersionDetected: (_current, latest) => {
      if (latest) localStorage.setItem('hehe-cycling-hud-current-version', latest);
      window.location.reload();
    },
  });

  return (
    <>
      {status === 'error' && (
        <Banner background="#c62828" color="#fff">Moblin-Verbindung fehlgeschlagen: {error}</Banner>
      )}
      {configLoaded && (
        <CyclingHud
          data={data ?? (isPreview ? { ...demoData, ...demoWeather, ...demoRide } : previewData)}
          config={config}
          pause={pause}
          gpxTrack={gpxTrack}
          logo={logo}
          widget={widget}
          slot={slot}
        />
      )}
      {debugVisible && <DebugPanel status={status} debug={debug} />}
    </>
  );
}

// wraps the whole overlay, not just the HUD - a throw anywhere here must never blank the page
ReactDOM.createRoot(document.getElementById('cycling')!).render(
  <HudErrorBoundary>
    <CyclingRoot />
  </HudErrorBoundary>
);
