// layout names this HUD ships an arrangement for (see src/hud/layouts/registry.ts) - HUD-layer
// policy, not core policy: core only passes through whatever string the user configured.
export const VALID_LAYOUTS = ['default', 'cockpit'] as const;
export const DEFAULT_LAYOUT = 'default';

export function resolveLayout(layout: string | undefined): string {
  return layout && (VALID_LAYOUTS as readonly string[]).includes(layout) ? layout : DEFAULT_LAYOUT;
}
