# CLAUDE.md

## Versioning

Every change that ships must bump `version` in `package.json` (patch for fixes, minor for features). The running HUD compares it against the deployed version (`src/hooks/useVersionCheck.ts`) to know when to reload.

## Single-widget mode

HeheChat's unified overlay source shows one cluster of the default layout per frame and places the frames per OBS scene: `#token=...&widget=info|gauges&slot=bottom-right` (`src/hud/layouts/widget.tsx`). `HUD_WIDGETS` there holds the design size of each cluster; the block types in HeheChat (`src/components/overlay/blocks.tsx`) must use the same shapes. HeheChat moves a frame by changing `slot` in the hash, which must not reload the page.
