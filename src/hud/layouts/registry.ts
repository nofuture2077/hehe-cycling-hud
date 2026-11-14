import type { ComponentType } from 'react';
import type { HudContext } from '../context';
import DefaultLayout, { widgets as defaultWidgets } from './default';
import CockpitLayout, { widgets as cockpitWidgets } from './CockpitLayout';
import NetrunnerLayout, { widgets as netrunnerWidgets } from './netrunner';
import FloatLayout, { widgets as floatWidgets } from './float';
import RingsLayout, { widgets as ringsWidgets } from './rings';
import RibbonLayout, { widgets as ribbonWidgets } from './ribbon';

export type Layout = ComponentType<{ ctx: HudContext }>;

// a group of a layout's widgets; className places it: a spot on the screen in the layout itself,
// or the frame of a single widget (layouts/widget.tsx)
export interface ClusterProps {
  ctx: HudContext;
  className: string;
}

// the clusters HeheChat's unified overlay source shows one per frame (layouts/widget.tsx), next to
// the track map, which is the same in every layout.
// width/height: what the cluster takes at the HUD's design scale with everything but the map switched on.
export type LayoutWidgets = Record<'info' | 'gauges', { width: number; height: number; Cluster: ComponentType<ClusterProps> }>;

export interface LayoutEntry {
  Layout: Layout;
  widgets: LayoutWidgets;
}

// which widget renders where, independent of theme (colors) - a third party can register a new
// arrangement of the existing widgets, or of their own registered widgets, under a new id
const layouts: Record<string, LayoutEntry> = {
  default: { Layout: DefaultLayout, widgets: defaultWidgets },
  cockpit: { Layout: CockpitLayout, widgets: cockpitWidgets },
  netrunner: { Layout: NetrunnerLayout, widgets: netrunnerWidgets },
  float: { Layout: FloatLayout, widgets: floatWidgets },
  rings: { Layout: RingsLayout, widgets: ringsWidgets },
  ribbon: { Layout: RibbonLayout, widgets: ribbonWidgets },
};

export function registerLayout(id: string, layout: LayoutEntry) {
  layouts[id] = layout;
}

export function getLayout(id: string): LayoutEntry {
  return layouts[id] ?? layouts.default;
}
