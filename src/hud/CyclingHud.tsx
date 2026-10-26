import { useEffect, useState } from 'react';
import { useGpxProgress } from '../core/useGpxProgress';
import { useHudVisibility } from '../core/useHudVisibility';
import { resolveTheme, loadThemeFont, isThemeFontReady } from './theme';
import { resolveLayout } from './layout';
import { getLayout } from './layouts/registry';
import {
  type CyclingData, type CyclingHudConfig, type LogoData, type PauseInfo, type GpxTrack,
  defaultConfig, defaultPause,
} from '../core/types';
import styles from './CyclingHud.module.css';

export type { CyclingData, CyclingHudVisibility, CyclingHudConfig, CyclingHudTheme, LogoData, PauseInfo } from '../core/types';

export default function CyclingHud({
  data,
  config = defaultConfig,
  pause = defaultPause,
  gpxTrack = null,
  logo = null,
}: {
  data: CyclingData;
  config?: CyclingHudConfig;
  pause?: PauseInfo;
  gpxTrack?: GpxTrack | null;
  logo?: LogoData | null;
}) {
  const gpx = useGpxProgress(gpxTrack, data, config);
  const visibility = useHudVisibility(data, config, pause, gpx, logo !== null);
  const Layout = getLayout(resolveLayout(config.layout));
  const theme = resolveTheme(config.theme);

  // stay invisible until the theme's fonts are in, so text doesn't flash in a fallback font first
  const [, setFontsLoadedFor] = useState<string | null>(null);
  const fontsReady = isThemeFontReady(theme);
  useEffect(() => {
    let cancelled = false;
    loadThemeFont(theme).then(() => {
      if (!cancelled) setFontsLoadedFor(theme);
    });
    return () => {
      cancelled = true;
    };
  }, [theme]);

  return (
    <div className={styles.root} data-theme={theme} style={fontsReady ? undefined : { visibility: 'hidden' }}>
      <Layout ctx={{ data, config, pause, logo, gpx, visibility }} />
      <div className={styles.scanlines} />
    </div>
  );
}
