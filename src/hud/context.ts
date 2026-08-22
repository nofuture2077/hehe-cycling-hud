import type { CyclingData, CyclingHudConfig, LogoData, PauseInfo } from '../core/types';
import type { GpxProgress } from '../core/useGpxProgress';
import type { HudVisibility } from '../core/useHudVisibility';

// the bundle every widget and layout renders from - computed once by CyclingHud.tsx from the
// core hooks, so neither a widget nor a layout ever has to touch useCyclingCore/useGpxProgress/
// useHudVisibility directly
export interface HudContext {
  data: CyclingData;
  config: CyclingHudConfig;
  pause: PauseInfo;
  logo: LogoData | null;
  gpx: GpxProgress;
  visibility: HudVisibility;
}
