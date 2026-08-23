import { useEffect } from 'react';
import { useGpxProgress } from '../core/useGpxProgress';
import { useHudVisibility } from '../core/useHudVisibility';
import { resolveTheme, loadThemeFont } from './theme';
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
  const gpx = useGpxProgress(gpxTrack, data);
  const visibility = useHudVisibility(data, config, pause, gpx, logo !== null);
  const Layout = getLayout(resolveLayout(config.layout));
  const theme = resolveTheme(config.theme);

  useEffect(() => {
    loadThemeFont(theme);
  }, [theme]);

  return (
    <div className={styles.root} data-theme={theme}>
      <Layout ctx={{ data, config, pause, logo, gpx, visibility }} />
    </div>
  );
}
