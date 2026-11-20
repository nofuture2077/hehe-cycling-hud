# CLAUDE.md

## Versioning

Every change that ships must bump `version` in `package.json` (patch for fixes, minor for features). The running HUD compares it against the deployed version (`src/hooks/useVersionCheck.ts`) to know when to reload.

## Single-widget mode

HeheChat's unified overlay source shows one cluster per frame and places the frames per OBS scene: `#widget=info|gauges|map|elevation&slot=bottom-right` (`src/hud/layouts/widget.tsx`). `info` and `gauges` are clusters of the configured layout without its placement (`widgets` exported by each layout, with their design size); `map` is the track map and `elevation` the elevation profile, each the same in every layout, and the other clusters leave them out. A new layout exports its `widgets` too. The block types in HeheChat (`src/components/overlay/blocks.tsx`, `hud.ts`) take the shape of the chosen layout's cluster, so a layout's `widgets` size and HeheChat's shape for it change together. HeheChat moves a frame by changing `slot` in the hash, which must not reload the page. The frame carries the slot's side (`data-align`): on the right or in the middle it sets `--hud-align`, `--hud-row` and `--hud-logo-margin`, which the layouts' CSS reads so a cluster's parts lean that way; the full layout leaves them unset.

A widget opens no backend connection: the overlay relays what it needs from its own (`Stats`, `gpx-track`, the `streamOnline` chat message) as `postMessage({ type: 'hehe-hud:message', data })`, the backend message as it came, handled like one from the WebSocket (`handleMessage` in `useCyclingCore`). The widget posts `{ type: 'hehe-hud:ready' }` to its parent once it listens, and the overlay answers with the active GPX track.

A frame's settings are those of its overlay block, in the hash as JSON (`&settings={...}`, changed the same way): the keys of the profile config (`cyclingHudTheme`, `showGpxMap`, ...) plus `cyclingHudLogo`, the block's logo as an image (data URL), shown whenever there is one. They replace the profile config and the uploaded logo (`useCyclingCore(settings)`); a key the block doesn't have keeps the HUD's default. The words and units shown next to the values (Speed, HR, Break {count}, to go, km/h, bpm, ...) are such keys too, `cyclingHudText<Key>` for each key of `HudTexts` (`src/core/types/config.ts`), so a block can change or translate them. The block types and their settings are HeheChat's (`src/components/overlay/hud.ts`). The map and elevation widgets show whenever there is a GPX track. The standalone HUD (no `widget`) still reads the profile config; HeheChat no longer offers its URL or settings, it keeps working for whoever still has it in OBS.

## Security

`.github/workflows/security.yml` runs on every PR and push to `release` and every Monday: Semgrep (static analysis, fails on ERROR findings; a false positive gets `// nosemgrep: <rule-id> -- <reason>`), OSV-Scanner on the lockfile (fails on any known vulnerability) and, on `release`, a CycloneDX SBOM as the run's artifact. `/cve-fix` runs the `cve-fixer` agent ([.claude/agents/cve-fixer.md](.claude/agents/cve-fixer.md)): it upgrades vulnerable dependencies on a `bugfix/cve-<date>` branch and opens a PR to `release`. An advisory with no fix that does not affect us goes into `osv-scanner.toml` (`[[IgnoredVulns]]` with `id`, `reason` and `ignoreUntil`).
