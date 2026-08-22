import { useLingering } from './useLingering';
import type { CyclingData, CyclingHudConfig, PauseInfo } from './types';
import type { GpxProgress } from './useGpxProgress';

export interface HudVisibility {
  showSpeed: boolean;
  showGradient: boolean;
  showPause: boolean;
  showHeartRate: boolean;
  showPower: boolean;
  showElevation: boolean;
  showLogo: boolean;
  showGpxMap: boolean;
  showGpxWaypoints: boolean;
  showGpxElevationMap: boolean;
  showGpxRemainingDistance: boolean;
  showGpxRemainingElevation: boolean;
  showTopChips: boolean;
  showBottomGauges: boolean;
  showAnyGauge: boolean;
  speedFading: boolean;
  gradientFading: boolean;
}

// centralizes the show/hide decisions any layout needs: threshold checks (moving/gradient),
// linger-then-fade timing, and gpx-track-dependent sections - so a new layout never has to
// reimplement this logic to decide what to render
export function useHudVisibility(
  data: CyclingData,
  config: CyclingHudConfig,
  pause: PauseInfo,
  gpx: Pick<GpxProgress, 'points' | 'waypoints'>,
  logoPresent: boolean,
): HudVisibility {
  const { visible } = config;

  const isMoving = data.speedKmh >= config.minSpeedKmh;
  const speedActive = visible.speed && isMoving && !pause.onBreak;
  const gradientAboveThreshold = Math.abs(data.gradientPercent) >= config.minGradientPercent;
  const gradientMovingOk = !config.gradientOnlyWhenMoving || isMoving;
  const gradientActive = visible.gradient && gradientAboveThreshold && gradientMovingOk;

  const speedLinger = useLingering(speedActive, config.hideLingerMs);
  const gradientLinger = useLingering(gradientActive, config.hideLingerMs);
  const showSpeed = speedLinger.visible && !pause.onBreak;
  const showGradient = gradientLinger.visible && !pause.onBreak;
  const showPause = pause.onBreak;

  const showElevation = visible.elevation;
  const showGpxMap = visible.showGpxMap && gpx.points.length > 0;
  const showGpxWaypoints = visible.showGpxWaypoints && gpx.waypoints.length > 0;
  const showGpxElevationMap = visible.showGpxElevationMap && gpx.points.length > 0;
  const showGpxRemainingDistance = visible.showGpxRemainingDistance && gpx.points.length > 0;
  const showGpxRemainingElevation = visible.showGpxRemainingElevation && gpx.points.length > 0;

  const showTopChips = visible.location || visible.distance || showElevation || showGpxMap;
  const showBottomGauges = showSpeed || showGradient || showPause;

  const showLogo = visible.showLogo && logoPresent;

  const showHeartRate = visible.heartRate && data.heartRateBpm > 0 && !pause.onBreak;
  const showPower = visible.power && data.powerWatts > 0 && !pause.onBreak;
  const showAnyGauge = showBottomGauges || showHeartRate || showPower || showGpxElevationMap;

  return {
    showSpeed,
    showGradient,
    showPause,
    showHeartRate,
    showPower,
    showElevation,
    showLogo,
    showGpxMap,
    showGpxWaypoints,
    showGpxElevationMap,
    showGpxRemainingDistance,
    showGpxRemainingElevation,
    showTopChips,
    showBottomGauges,
    showAnyGauge,
    speedFading: speedLinger.fading,
    gradientFading: gradientLinger.fading,
  };
}
