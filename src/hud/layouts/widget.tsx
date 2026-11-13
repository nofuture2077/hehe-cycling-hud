import { useEffect, useState } from 'react';
import type { HudContext } from '../context';
import { GaugeCluster, InfoCluster } from './default';
import styles from '../CyclingHud.module.css';

// the clusters of the default layout, each on its own - for HeheChat's unified overlay source,
// which shows a cluster in a frame of its own and places that frame per OBS scene
// (#token=...&widget=gauges&slot=bottom-right).
// width/height: what the cluster takes at the HUD's design scale with everything switched on.
// HeheChat gives the frame this shape (BLOCK_TYPES in its src/components/overlay/blocks.tsx), and the
// cluster is scaled to fill it - by this fixed size, not by what is on screen right now, so it
// doesn't grow and shrink as gauges come and go.
export const HUD_WIDGETS = {
  info: { width: 520, height: 402, Cluster: InfoCluster },
  gauges: { width: 760, height: 140, Cluster: GaugeCluster },
} as const;

export type HudWidgetId = keyof typeof HUD_WIDGETS;

export function isHudWidget(id: string | null): id is HudWidgetId {
  return id !== null && Object.keys(HUD_WIDGETS).includes(id);
}

// how much the design size has to shrink or grow to fit the frame
function useFrameScale(width: number, height: number) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / width, window.innerHeight / height));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [width, height]);

  return scale;
}

const FLEX_ALIGN: Record<string, string> = {
  top: 'flex-start',
  left: 'flex-start',
  middle: 'center',
  center: 'center',
  bottom: 'flex-end',
  right: 'flex-end',
};

// slot: where on the screen HeheChat shows the frame, e.g. 'bottom-right' - the cluster hugs that
// corner of the frame, so it stays put there while it has less to show
export default function WidgetLayout({ ctx, widget, slot }: { ctx: HudContext; widget: HudWidgetId; slot: string }) {
  const { width, height, Cluster } = HUD_WIDGETS[widget];
  const scale = useFrameScale(width, height);
  const [vertical = 'top', horizontal = 'left'] = slot.split('-');

  return (
    <div className={styles.frame} style={{ alignItems: FLEX_ALIGN[vertical], justifyContent: FLEX_ALIGN[horizontal] }}>
      <div
        style={{
          flexShrink: 0,
          transform: `scale(${scale})`,
          transformOrigin: `${vertical === 'middle' ? 'center' : vertical} ${horizontal}`,
        }}
      >
        <Cluster ctx={ctx} className={styles.framed} />
      </div>
    </div>
  );
}
