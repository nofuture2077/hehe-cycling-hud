import { useEffect, useState } from 'react';
import { useGpxProgress } from '../core/useGpxProgress';
import { useHudVisibility } from '../core/useHudVisibility';
import { resolveTheme, loadThemeFont, isThemeFontReady } from './theme';
import { lookStyle } from './look';
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
  data: telemetry,
  config: configured = defaultConfig,
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
  // show just this cluster of the configured layout, filling the page (layouts/widget.tsx)
  widget?: HudWidgetId;
  slot?: string;
}) {
  // the streamer's own place name takes the place of the city, and of the region and country (the flag stays); the
  // run number HeheChat hands over that of the HUD's own count (which still says when the rider is on the lift)
  const own = configured.locationName;
  const counted = configured.runCount === null ? telemetry : { ...telemetry, runCount: configured.runCount };
  const data = own ? { ...counted, city: own, region: '', country: '' } : counted;
  const config = own ? { ...configured, visible: { ...configured.visible, locationCity: true } } : configured;
  const gpx = useGpxProgress(gpxTrack, data, config);
  const visibility = useHudVisibility(data, config, pause, gpx, logo !== null);
  const layout = resolveLayout(config.layout);
  const { Layout } = getLayout(layout);
  const theme = resolveTheme(config.theme);
  const fonts = [config.look?.font, config.look?.labelFont, config.look?.textFont];
  const fontsKey = fonts.join('|');

  // stay invisible until the theme's fonts are in, so text doesn't flash in a fallback font first
  const [, setFontsLoadedFor] = useState<string | null>(null);
  const fontsReady = isThemeFontReady(theme, fonts);
  useEffect(() => {
    let cancelled = false;
    loadThemeFont(theme, fonts).then(() => {
      if (!cancelled) setFontsLoadedFor(`${theme}|${fontsKey}`);
    });
    return () => {
      cancelled = true;
    };
  }, [theme, fontsKey]);

  const ctx = { data, config, pause, logo, gpx, visibility };

  return (
    <div
      className={`${styles.root} ${widget ? styles.widget : ''}`}
      data-theme={theme}
      data-look={config.look ? '' : undefined}
      style={{ ...lookStyle(config.look), ...(fontsReady ? {} : { visibility: 'hidden' }) }}
    >
      {widget ? <WidgetLayout ctx={ctx} layout={layout} widget={widget} slot={slot} /> : <Layout ctx={ctx} />}
      <div className={styles.scanlines} />
    </div>
  );
}
