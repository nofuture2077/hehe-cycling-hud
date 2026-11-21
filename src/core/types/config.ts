export interface CyclingHudVisibility {
  speed: boolean;
  distance: boolean;
  location: boolean;
  locationCity: boolean;
  locationRegion: boolean;
  locationCountry: boolean;
  locationFlag: boolean;
  locationTemperature: boolean;
  // the animated weather icon (WeatherIcon), only when Moblin sends the condition
  locationWeather: boolean;
  // the float layout lets the weather happen around the location and the stats (WeatherAtmosphere)
  locationWeatherAtmosphere: boolean;
  locationFeelsLike: boolean;
  locationWind: boolean;
  locationHumidity: boolean;
  locationLocalTime: boolean;
  gradient: boolean;
  elevation: boolean;
  heartRate: boolean;
  power: boolean;
  // the snowboard layout's (alpine): the altitude, the runs, the vertical meters ridden down
  altitude: boolean;
  runs: boolean;
  vertical: boolean;
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
  // fallback route totals (km / m gain) for remaining distance/elevation when no GPX track is active; 0 = off
  goalDistanceKm: number;
  goalElevationM: number;
  // radius (meters) around the live position the map crops to; null shows the whole track
  gpxMapRadius: number | null;
  // how the track map and elevation profile look
  trackStyle: TrackStyle;
  // colors, font, corners and shadow of the theme of HeheChat's unified overlay, which take the place of the theme's
  // own; null in the standalone HUD
  look: HudLook | null;
  // the words shown next to the values
  texts: HudTexts;
  // a place name of the streamer's own (e.g. 'Matterhorn' instead of Zermatt), shown in place of the city, region and
  // country Moblin sends; '' shows those
  locationName: string;
  // the run number HeheChat's info block hands over (the server counts it, the streamer may set it live), in place of
  // the one this HUD counts; null without one (the standalone HUD)
  runCount: number | null;
}

// The words the HUD shows next to its values, each set by a HeheChat HUD block (cyclingHudText<Key> in its settings,
// e.g. cyclingHudTextSpeed) to change or translate it; breakCount fills in {count}, the number of the break. The units
// too: unitMinShort is the one of the total break time in the pause gauge.
export interface HudTexts {
  speed: string;
  heartRateShort: string;
  heartRate: string;
  power: string;
  gradient: string;
  onBreak: string;
  breakCount: string;
  distance: string;
  climbed: string;
  toGo: string;
  toClimb: string;
  feelsLike: string;
  altitude: string;
  vertical: string;
  runs: string;
  slope: string;
  max: string;
  onLift: string;
  unitKm: string;
  unitM: string;
  unitKmh: string;
  unitBpm: string;
  unitW: string;
  unitPercent: string;
  unitSec: string;
  unitMin: string;
  unitMinShort: string;
  unitDeg: string;
}

export const defaultTexts: HudTexts = {
  speed: 'Speed',
  heartRateShort: 'HR',
  heartRate: 'Heart rate',
  power: 'Power',
  gradient: 'Gradient',
  onBreak: 'On Break',
  breakCount: 'Break {count}',
  distance: 'Distance',
  climbed: 'Climbed',
  toGo: 'to go',
  toClimb: 'to climb',
  feelsLike: 'feels',
  altitude: 'Altitude',
  vertical: 'Vertical',
  runs: 'Run',
  slope: 'Slope',
  max: 'Max',
  onLift: 'Lift',
  unitKm: 'km',
  unitM: 'm',
  unitKmh: 'km/h',
  unitBpm: 'bpm',
  unitW: 'W',
  unitPercent: '%',
  unitSec: 'sec',
  unitMin: 'min',
  unitMinShort: 'm',
  unitDeg: '°',
};

// The overlay theme of a HUD block (HeheChat src/components/overlay/theme.ts): a CSS color per role, a font family
// ('default': the theme's own), corners ('none', 'small', 'round' or 'pill') and the text shadow ('on' or 'off')
export interface HudLook {
  colors: Record<'text' | 'muted' | 'background' | 'card' | 'accent' | 'accent2' | 'accent3' | 'onAccent', string>;
  // headlines and values; labels and units, running text (sent by HeheChat since it has them, the font before)
  font: string;
  labelFont?: string;
  textFont?: string;
  radius: string;
  shadow: string;
}

export interface TrackStyle {
  // the panel behind the map or profile: 'none', 'glass', 'dark' or 'light' (hud/trackLook.ts)
  panel: string;
  // the color of the track's line, a CSS color; '' leaves it to the theme
  lineColor: string;
  // grid lines behind the track; null leaves it to the theme
  grid: boolean | null;
  // the profile's height axis starts at 0 m (sea level) instead of the lowest point shown
  elevationFromZero: boolean;
  // the smallest height range the profile spans, so a flat stretch reads as flat
  elevationMinSpanM: number;
}

export const defaultTrackStyle: TrackStyle = {
  panel: 'none',
  lineColor: '',
  grid: null,
  elevationFromZero: false,
  elevationMinSpanM: 200,
};

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
    locationWeather: true,
    locationWeatherAtmosphere: false,
    locationFeelsLike: false,
    locationWind: false,
    locationHumidity: false,
    locationLocalTime: false,
    gradient: true,
    elevation: true,
    heartRate: true,
    power: true,
    altitude: true,
    runs: true,
    vertical: true,
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
  goalDistanceKm: 0,
  goalElevationM: 0,
  gpxMapRadius: 50000,
  trackStyle: defaultTrackStyle,
  look: null,
  texts: defaultTexts,
  locationName: '',
  runCount: null,
};
