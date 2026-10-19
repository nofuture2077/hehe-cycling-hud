import { gradientLevel, heartRateZone, powerZone, speedLevel } from '../../core/zones';
import { currentPauseParts } from '../format';
import type { HudContext } from '../context';

export type MetricId = 'speed' | 'pause' | 'hr' | 'power' | 'grade';

// one normalized description of a live metric, so the minimal layouts (float/rings/ribbon) can
// each render it their own way - dot, ring, accent line - without re-deriving zones, percents or
// visibility. Color is the metric's identity hue (not a zone ramp); zone only modulates intensity.
export interface MetricDescriptor {
  id: MetricId;
  label: string;
  value: number;
  digits: number;
  // mm:ss style values (pause) render as value + separator + decimal
  decimal?: number;
  separator?: string;
  unit: string;
  // 0-100, how full a ring/line renders
  percent: number;
  // 1-5
  zone: number;
  color: string;
  visible: boolean;
  fading: boolean;
}

export const METRIC_COLORS: Record<MetricId | 'elev' | 'distance', string> = {
  speed: 'var(--hud-metric-speed, #38bdf8)',
  pause: 'var(--hud-metric-pause, #f472b6)',
  hr: 'var(--hud-metric-hr, #ff5d73)',
  power: 'var(--hud-metric-power, #a78bfa)',
  grade: 'var(--hud-metric-grade, #a3e635)',
  elev: 'var(--hud-metric-elev, #fbbf24)',
  distance: 'var(--hud-metric-distance, #2dd4bf)',
};

const clampPct = (n: number) => Math.max(0, Math.min(100, n));
const clampZone = (n: number) => Math.max(1, Math.min(5, n));

// speed and pause share the primary slot, same as PrimaryGaugeWidget/SpeedBarWidget: a rider is
// either moving or on a break, never both
export function primaryMetric(ctx: HudContext): MetricDescriptor {
  const { data, pause, visibility } = ctx;
  if (visibility.showPause) {
    const { value, decimal } = currentPauseParts(pause.currentBreakSeconds);
    return {
      id: 'pause',
      label: `break ${pause.breakCount}`,
      value,
      digits: 0,
      decimal,
      separator: ':',
      unit: 'min',
      percent: clampPct((pause.currentBreakSeconds / 900) * 100),
      zone: 1,
      color: METRIC_COLORS.pause,
      visible: true,
      fading: false,
    };
  }
  const speed = Math.max(0, data.speedKmh);
  return {
    id: 'speed',
    label: 'speed',
    value: speed,
    digits: 0,
    unit: 'km/h',
    percent: clampPct((speed / 50) * 100),
    zone: clampZone(speedLevel(speed)),
    color: METRIC_COLORS.speed,
    visible: visibility.showSpeed,
    fading: visibility.speedFading,
  };
}

// heart rate, power, gradient - always returned in this order (so ring positions stay stable),
// with `visible` saying whether each one currently has anything to show
export function vitalMetrics(ctx: HudContext): MetricDescriptor[] {
  const { data, config, visibility } = ctx;
  return [
    {
      id: 'hr',
      label: 'heart rate',
      value: data.heartRateBpm,
      digits: 0,
      unit: 'bpm',
      percent: config.maxHeartRateBpm > 0 ? clampPct((data.heartRateBpm / config.maxHeartRateBpm) * 100) : 0,
      zone: heartRateZone(data.heartRateBpm, config.maxHeartRateBpm),
      color: METRIC_COLORS.hr,
      visible: visibility.showHeartRate,
      fading: false,
    },
    {
      id: 'power',
      label: 'power',
      value: data.powerWatts,
      digits: 0,
      unit: 'W',
      percent: config.averagePowerWatts > 0 ? clampPct((data.powerWatts / (config.averagePowerWatts * 2)) * 100) : 0,
      zone: clampZone(powerZone(data.powerWatts, config.averagePowerWatts)),
      color: METRIC_COLORS.power,
      visible: visibility.showPower,
      fading: false,
    },
    {
      id: 'grade',
      label: 'gradient',
      value: data.gradientPercent,
      digits: 1,
      unit: '%',
      percent: clampPct((Math.abs(data.gradientPercent) / 20) * 100),
      zone: clampZone(gradientLevel(data.gradientPercent) + 1),
      color: METRIC_COLORS.grade,
      visible: visibility.showGradient,
      fading: visibility.gradientFading,
    },
  ];
}
