export interface CyclingData {
  speedKmh: number;
  maxSpeedKmh: number;
  distanceKm: number;
  splitDistanceKm: number;
  location: string;
  gradientPercent: number;
  maxGradientPercent: number;
  elevationGainM: number;
  elevationLossM: number;
  splitElevationGainM: number;
  splitElevationLossM: number;
  heartRateBpm: number;
  powerWatts: number;
}

export interface CyclingHudVisibility {
  speed: boolean;
  distance: boolean;
  location: boolean;
  gradient: boolean;
  elevation: boolean;
  heartRate: boolean;
  power: boolean;
  // when on, distance/elevation also show today's split values alongside the overall ones
  split: boolean;
  // when on, the speed/gradient gauges also show the ride's max as a secondary value
  showMax: boolean;
}

export interface CyclingHudConfig {
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
}

export const defaultConfig: CyclingHudConfig = {
  visible: {
    speed: true,
    distance: true,
    location: true,
    gradient: true,
    elevation: true,
    heartRate: true,
    power: true,
    split: false,
    showMax: false,
  },
  minSpeedKmh: 1,
  minGradientPercent: 1,
  gradientOnlyWhenMoving: true,
  hideLingerMs: 10000,
  maxHeartRateBpm: 190,
  averagePowerWatts: 250,
};

export interface PauseInfo {
  onBreak: boolean;
  currentBreakSeconds: number;
  totalBreakSeconds: number;
  breakCount: number;
}

export const defaultPause: PauseInfo = {
  onBreak: false, currentBreakSeconds: 0, totalBreakSeconds: 0, breakCount: 0,
};
