# CLAUDE.md

## Versioning

Every change that ships must bump `version` in `package.json` (patch for fixes, minor for features). The running HUD compares it against the deployed version (`src/hooks/useVersionCheck.ts`) to know when to reload.

## Single-widget mode

HeheChat's unified overlay source shows one cluster per frame and places the frames per OBS scene: `#token=...&widget=info|gauges|map&slot=bottom-right` (`src/hud/layouts/widget.tsx`). `info` and `gauges` are clusters of the configured layout without its placement (`widgets` exported by each layout, with their design size); `map` is the track map, the same in every layout, and the other clusters leave it out. A new layout exports its `widgets` too. The block types in HeheChat (`src/components/overlay/blocks.tsx`) use the shapes of the default layout's clusters. HeheChat moves a frame by changing `slot` in the hash, which must not reload the page.
