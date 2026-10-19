import { getWidget } from '../widgets/registry';
import type { HudContext } from '../context';
import styles from './ribbon.module.css';

const Logo = getWidget('logo');
const MinimalLocation = getWidget('minimalLocation');
const MetricRibbon = getWidget('metricRibbon');
const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');

// everything numeric lives in one frosted-glass strip centered along the bottom (distance and
// elevation included, so there's no separate stats block), the elevation profile floats just
// above it, and location is a single line of text top-left
export default function RibbonLayout({ ctx }: { ctx: HudContext }) {
  const { visibility } = ctx;

  return (
    <>
      <div className={styles.topLeft}>
        <Logo ctx={ctx} />
        <MinimalLocation ctx={ctx} />
      </div>

      {visibility.showGpxMap && (
        <div className={styles.topRight}>
          <TrackMap ctx={ctx} />
        </div>
      )}

      <div className={styles.bottomCenter}>
        <ElevationProfile ctx={ctx} />
        <MetricRibbon ctx={ctx} />
      </div>
    </>
  );
}
