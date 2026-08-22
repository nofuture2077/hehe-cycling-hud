export interface CyclingHudVisibility {
  speed: boolean;
  distance: boolean;
  location: boolean;
  locationCity: boolean;
  locationRegion: boolean;
  locationCountry: boolean;
  locationFlag: boolean;
  locationTemperature: boolean;
  locationLocalTime: boolean;
  gradient: boolean;
  elevation: boolean;
  heartRate: boolean;
  power: boolean;
  // when on, distance/elevation also show today's split values alongside the overall ones
  split: boolean;
  // when on, the speed/gradient gauges also show the ride's max as a secondary value
  showMax: boolean;
  // GPX track overlay sections - only render once a gpx-track message has arrived
  showGpxMap: boolean;
  showGpxElevationMap: boolean;
  showGpxPosition: boolean;
  showGpxElevationPosition: boolean;
  showGpxRemainingDistance: boolean;
  showGpxRemainingElevation: boolean;
  showGpxWaypoints: boolean;
  // custom logo - only renders once both this is on and a logo has been uploaded
  showLogo: boolean;
}

// raw strings, not closed unions: core just passes through whatever names arrive from config, so
// any HUD layer can define its own set of supported theme/layout names without a core change.
// theme = colors/fonts/spacing only; layout = which widget renders where - independent axes.
export type CyclingHudTheme = string;
export type CyclingHudLayout = string;

export interface CyclingHudConfig {
  // overall visual style of the HUD - a HUD layer decides which names it recognizes
  theme: CyclingHudTheme;
  // arrangement of widgets on screen - a HUD layer decides which names it recognizes
  layout: CyclingHudLayout;
  visible: CyclingHudVisibility;
  // dynamic elements hide themselves below these thresholds
  minSpeedKmh: number;
  minGradientPercent: number;
  // when on, the slope gauge also requires speed >= minSpeedKmh to show
  gradientOnlyWhenMoving: boolean;
  // once a dynamic element drops below its threshold, it lingers this long before hiding
  hideLingerMs: number;
  // personal baselines the heart rate/power gauges use to compute zones
  maxHeartRateBpm: number;
  averagePowerWatts: number;
  // radius (meters) around the live position the map crops to; null shows the whole track
  gpxMapRadius: number | null;
}

export const defaultConfig: CyclingHudConfig = {
  theme: 'classic',
  layout: 'default',
  visible: {
    speed: true,
    distance: true,
    location: true,
    locationCity: true,
    locationRegion: false,
    locationCountry: false,
    locationFlag: true,
    locationTemperature: false,
    locationLocalTime: false,
    gradient: true,
    elevation: true,
    heartRate: true,
    power: true,
    split: false,
    showMax: false,
    showGpxMap: false,
    showGpxElevationMap: false,
    showGpxPosition: true,
    showGpxElevationPosition: true,
    showGpxRemainingDistance: false,
    showGpxRemainingElevation: false,
    showGpxWaypoints: false,
    showLogo: false,
  },
  minSpeedKmh: 1,
  minGradientPercent: 1,
  gradientOnlyWhenMoving: true,
  hideLingerMs: 10000,
  maxHeartRateBpm: 190,
  averagePowerWatts: 250,
  gpxMapRadius: 50000,
};
