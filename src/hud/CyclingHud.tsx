import { useEffect, useState } from 'react';
import { useGpxProgress } from '../core/useGpxProgress';
import { useHudVisibility } from '../core/useHudVisibility';
import { resolveTheme, loadThemeFont, isThemeFontReady } from './theme';
import { resolveLayout } from './layout';
import { getLayout } from './layouts/registry';
import WidgetLayout, { type HudWidgetId } from './layouts/widget';
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
  widget,
  slot = 'top-left',
}: {
  data: CyclingData;
  config?: CyclingHudConfig;
  pause?: PauseInfo;
  gpxTrack?: GpxTrack | null;
  logo?: LogoData | null;
  // show just this cluster, filling the page, instead of the configured layout (layouts/widget.tsx)
  widget?: HudWidgetId;
  slot?: string;
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

  const ctx = { data, config, pause, logo, gpx, visibility };

  return (
    <div
      className={`${styles.root} ${widget ? styles.widget : ''}`}
      data-theme={theme}
      style={fontsReady ? undefined : { visibility: 'hidden' }}
    >
      {widget ? <WidgetLayout ctx={ctx} widget={widget} slot={slot} /> : <Layout ctx={ctx} />}
      <div className={styles.scanlines} />
    </div>
  );
}
