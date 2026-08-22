import type { ComponentType } from 'react';
import type { HudContext } from '../context';
import { LogoWidget } from './LogoWidget';
import { LocationChipWidget } from './LocationChipWidget';
import { StatsCardWidget } from './StatsCardWidget';
import { TrackMapWidget } from './TrackMapWidget';
import { ElevationProfileWidget } from './ElevationProfileWidget';
import { HeartRateGaugeWidget } from './HeartRateGaugeWidget';
import { PowerGaugeWidget } from './PowerGaugeWidget';
import { GradientGaugeWidget } from './GradientGaugeWidget';
import { PrimaryGaugeWidget } from './PrimaryGaugeWidget';

export type Widget = ComponentType<{ ctx: HudContext }>;

// every widget takes the same HudContext bundle and decides for itself whether it has anything
// to render (returning null when hidden) - a layout just says which widgets go where, never how
// they compute their own visibility
const widgets: Record<string, Widget> = {
  logo: LogoWidget,
  locationChip: LocationChipWidget,
  statsCard: StatsCardWidget,
  trackMap: TrackMapWidget,
  elevationProfile: ElevationProfileWidget,
  heartRateGauge: HeartRateGaugeWidget,
  powerGauge: PowerGaugeWidget,
  gradientGauge: GradientGaugeWidget,
  primaryGauge: PrimaryGaugeWidget,
};

// lets a third party register a new/replacement widget under an id, then reference it from a
// custom layout without forking the built-in widget files
export function registerWidget(id: string, widget: Widget) {
  widgets[id] = widget;
}

export function getWidget(id: string): Widget {
  const widget = widgets[id];
  if (!widget) throw new Error(`Unknown HUD widget: "${id}"`);
  return widget;
}
