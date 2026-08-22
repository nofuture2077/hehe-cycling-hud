import type { ComponentType } from 'react';
import type { HudContext } from '../context';
import DefaultLayout from './default';
import CockpitLayout from './CockpitLayout';

export type Layout = ComponentType<{ ctx: HudContext }>;

// which widget renders where, independent of theme (colors) - a third party can register a new
// arrangement of the existing widgets, or of their own registered widgets, under a new id
const layouts: Record<string, Layout> = {
  default: DefaultLayout,
  cockpit: CockpitLayout,
};

export function registerLayout(id: string, layout: Layout) {
  layouts[id] = layout;
}

export function getLayout(id: string): Layout {
  return layouts[id] ?? layouts.default;
}
