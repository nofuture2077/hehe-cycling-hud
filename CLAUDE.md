# CLAUDE.md

## Versioning

Every change that ships must bump `version` in `package.json` (patch for fixes, minor for features). The running HUD compares it against the deployed version (`src/hooks/useVersionCheck.ts`) to know when to reload.
